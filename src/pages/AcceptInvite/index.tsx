import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { invokeAuthenticatedEdgeFunction } from '@/lib/supabase-edge'
import { useAuth } from '@/contexts/AuthContext'
import { showSuccess, showError } from '@/lib/sonner'
import { Users, Loader2, CheckCircle2, XCircle, LogIn } from 'lucide-react'
import { BrandedLoader } from '@/components/ui/BrandedLoader'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  const inviteId = searchParams.get('inviteId')
  
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [teamName, setTeamName] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteId) {
      setError('Link de convite inválido')
      setLoading(false)
      return
    }

    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    // Auto-accept if user is logged in
    handleAcceptInvite()
  }, [inviteId, user, authLoading])

  const handleAcceptInvite = async () => {
    if (!inviteId || !user) return

    setAccepting(true)
    setError(null)

    try {
      const source = searchParams.get('source')
      const sourcePath = source === 'remax' ? '/accept-invite' : window.location.pathname

      const { data, error } = await invokeAuthenticatedEdgeFunction<{ teamName?: string; message?: string; error?: string }>('accept-team-invite', {
        body: { inviteId, source, sourcePath },
      })

      if (error) {
        setError(error.message)
        setAccepting(false)
        return
      }

      setSuccess(true)
      setTeamName(data?.teamName || 'o time')
      showSuccess(data?.message || 'Convite aceito com sucesso!')

      setTimeout(() => {
        navigate('/home')
      }, 2000)
    } catch (err) {
      console.error('Error accepting invite:', err)
      setError(err instanceof Error ? err.message : 'Erro ao aceitar convite')
    } finally {
      setAccepting(false)
      setLoading(false)
    }
  }

  const handleLogin = () => {
    // Store invite ID to process after login
    sessionStorage.setItem('pendingInviteId', inviteId || '')
    navigate('/auth/signin')
  }

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <BrandedLoader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A3F74]/5 via-background to-[#DF6009]/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DF6009]/10">
            <Users className="h-8 w-8 text-[#DF6009]" />
          </div>
          <CardTitle className="text-2xl">Convite de Time</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte de um time no Avaluz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => navigate('/home')} variant="outline">
                Voltar para o início
              </Button>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Convite aceito!</p>
                <p className="text-sm text-muted-foreground">
                  Você agora faz parte do time {teamName}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecionando...
              </p>
            </div>
          )}

          {/* Not logged in */}
          {!user && !error && !success && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Você precisa estar logado para aceitar este convite.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleLogin} className="bg-[#DF6009] text-white hover:bg-[#DF6009]/90">
                  <LogIn className="mr-2 h-4 w-4" />
                  Fazer login
                </Button>
                <Button 
                  onClick={() => navigate('/auth/signup')} 
                  variant="outline"
                >
                  Criar conta
                </Button>
              </div>
            </div>
          )}

          {/* Accepting state */}
          {accepting && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#DF6009]" />
              <p className="text-sm text-muted-foreground">Aceitando convite...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
