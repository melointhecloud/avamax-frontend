import type { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { invokeEdgeFunction } from '@/lib/supabase-edge'
import { getPlanKeyFromProductId, type StripePlanKey } from '@/lib/stripe'

interface IProfile {
    id: string
    email: string | null
    credits: number
    avatar_url: string | null
    nome: string | null
    creci: string | null
    imobiliaria: string | null
    telefone: string | null
    plano: string | null
    logo_imobiliaria_url?: string | null
    signature_url?: string | null
    organization?: string | null
    remax_franchise_id?: string | null
    remax_onboarding_complete?: boolean
    mfr_id?: string | null
    is_ceo?: boolean | null
}

interface ISubscriptionState {
    isSubscribed: boolean
    subscriptionTier: StripePlanKey | null
    subscriptionEnd: string | null
    loading: boolean
}

interface IAuthContextData {
    user: User | null
    profile: IProfile | null
    loading: boolean
    subscription: ISubscriptionState
    refreshProfile: () => Promise<void>
    refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<IProfile | null>(null)

    const [authLoading, setAuthLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileFetched, setProfileFetched] = useState(false)

    const [subscription, setSubscription] = useState<ISubscriptionState>({
        isSubscribed: false,
        subscriptionTier: null,
        subscriptionEnd: null,
        loading: false,
    })

    useEffect(() => {
        let mounted = true

        const {
            data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((event, nextSession) => {
            if (!mounted) return
            
            // Limpar profile imediatamente quando a sessão é perdida
            if (event === 'SIGNED_OUT' || !nextSession) {
                setProfile(null)
            }
            
            setSession(nextSession)
            setUser(nextSession?.user ?? null)
        })

        supabase.auth
            .getSession()
            .then(({ data }) => {
                if (!mounted) return
                const s = data.session
                // If session token is expired, discard it immediately
                if (s?.expires_at && Date.now() / 1000 > s.expires_at) {
                    console.warn('[AuthContext] Session expired, clearing')
                    setSession(null)
                    setUser(null)
                    supabase.auth.signOut().catch(() => {})
                } else {
                    setSession(s ?? null)
                    setUser(s?.user ?? null)
                }
            })
            .finally(() => {
                if (!mounted) return
                setAuthLoading(false)
            })

        return () => {
            mounted = false
            authSubscription.unsubscribe()
        }
    }, [])

    // Safety timeout: prevent infinite loader in edge cases
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAuthLoading(false)
        }, 10000)
        return () => clearTimeout(timeout)
    }, [])

    // Fetch profile when user changes
    useEffect(() => {
        let cancelled = false

        if (!user) {
            setProfile(null)
            setProfileLoading(false)
            setProfileFetched(false)
            return
        }

        setProfileLoading(true)

        const t = window.setTimeout(() => {
            ;(async () => {
                try {
                    // Query direta com RLS (precisamos dos campos extras como logo_imobiliaria_url)
                    const { data, error } = await supabase
                        .from('profiles')
                        .select(
                            'id,email,credits,avatar_url,nome,creci,imobiliaria,telefone,plano,logo_imobiliaria_url,signature_url,organization,remax_franchise_id,remax_onboarding_complete,mfr_id,is_ceo'
                        )
                        .eq('id', user.id)
                        .maybeSingle()

                    if (cancelled) return
                    if (error) throw error
                    setProfile(
                        data
                            ? {
                                  id: data.id,
                                  email: data.email ?? null,
                                  credits: data.credits ?? 0,
                                  avatar_url: data.avatar_url ?? null,
                                  nome: data.nome ?? null,
                                  creci: data.creci ?? null,
                                  imobiliaria: data.imobiliaria ?? null,
                                  telefone: data.telefone ?? null,
                                  plano: data.plano ?? 'gratis',
                                  logo_imobiliaria_url: data.logo_imobiliaria_url ?? null,
                                  signature_url: data.signature_url ?? null,
                                  organization: data.organization ?? null,
                                  remax_franchise_id: data.remax_franchise_id ?? null,
                                  remax_onboarding_complete: data.remax_onboarding_complete ?? false,
                                  mfr_id: data.mfr_id ?? null,
                                  is_ceo: data.is_ceo ?? false,
                              }
                            : null
                    )
                } catch (err) {
                    if (cancelled) return
                    console.error('Erro ao carregar profile:', err)
                    setProfile(null)
                } finally {
                    if (cancelled) return
                    setProfileLoading(false)
                    setProfileFetched(true)
                }
            })()
        }, 0)

        return () => {
            cancelled = true
            window.clearTimeout(t)
        }
    }, [user?.id])

    const refreshSubscription = useCallback(async () => {
        if (!session?.access_token) {
            setSubscription({
                isSubscribed: false,
                subscriptionTier: null,
                subscriptionEnd: null,
                loading: false,
            })
            return
        }

        // Check if token is expired
        const expiresAt = session.expires_at
        if (expiresAt && Date.now() / 1000 > expiresAt) {
            setSubscription({
                isSubscribed: false,
                subscriptionTier: null,
                subscriptionEnd: null,
                loading: false,
            })
            return
        }

        setSubscription(prev => ({ ...prev, loading: true }))

        try {
            const { data, error } = await invokeEdgeFunction<{ subscribed: boolean; productId: string; subscriptionEnd: string }>('check-subscription', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                silent: true,
            })

            if (error) throw error

            const tier = getPlanKeyFromProductId(data.productId)
            setSubscription({
                isSubscribed: data.subscribed,
                subscriptionTier: tier,
                subscriptionEnd: data.subscriptionEnd,
                loading: false,
            })
        } catch (err) {
            // Silently handle auth errors - just set as unsubscribed
            console.warn('Subscription check failed:', err)
            setSubscription({
                isSubscribed: false,
                subscriptionTier: null,
                subscriptionEnd: null,
                loading: false,
            })
        }
    }, [session?.access_token, session?.expires_at])

    // Check subscription when session changes
    useEffect(() => {
        if (session?.access_token) {
            refreshSubscription()
        } else {
            setSubscription({
                isSubscribed: false,
                subscriptionTier: null,
                subscriptionEnd: null,
                loading: false,
            })
        }
    }, [session?.access_token, refreshSubscription])

    // Periodically refresh subscription (every 60 seconds)
    useEffect(() => {
        if (!session?.access_token) return

        const interval = setInterval(() => {
            refreshSubscription()
        }, 60000)

        return () => clearInterval(interval)
    }, [session?.access_token, refreshSubscription])

    const refreshProfile = useCallback(async () => {
        if (!user?.id) return
        
        try {
            // Query direta com RLS (precisamos dos campos extras como logo_imobiliaria_url)
            const { data, error } = await supabase
                .from('profiles')
                .select('id,email,credits,avatar_url,nome,creci,imobiliaria,telefone,plano,logo_imobiliaria_url,signature_url,organization,remax_franchise_id,remax_onboarding_complete,mfr_id,is_ceo')
                .eq('id', user.id)
                .maybeSingle()

            if (error) throw error
            setProfile(
                data
                    ? {
                          id: data.id,
                          email: data.email ?? null,
                          credits: data.credits ?? 0,
                          avatar_url: data.avatar_url ?? null,
                          nome: data.nome ?? null,
                          creci: data.creci ?? null,
                          imobiliaria: data.imobiliaria ?? null,
                          telefone: data.telefone ?? null,
                          plano: data.plano ?? 'gratis',
                          logo_imobiliaria_url: data.logo_imobiliaria_url ?? null,
                          signature_url: data.signature_url ?? null,
                          organization: data.organization ?? null,
                          remax_franchise_id: data.remax_franchise_id ?? null,
                          remax_onboarding_complete: data.remax_onboarding_complete ?? false,
                          mfr_id: data.mfr_id ?? null,
                          is_ceo: data.is_ceo ?? false,
                      }
                    : null
            )
        } catch (err) {
            console.error('Erro ao recarregar profile:', err)
        }
    }, [user?.id])

    // Loading: true se auth carregando OU se tem user mas profile ainda não existe
    const loading = useMemo(
        () => authLoading || (Boolean(user) && profileLoading) || (Boolean(user) && !profileFetched),
        [authLoading, profileLoading, user, profileFetched]
    )

    return (
        <AuthContext.Provider value={{ user, profile, loading, subscription, refreshProfile, refreshSubscription }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
