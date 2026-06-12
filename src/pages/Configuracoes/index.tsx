import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateProfile } from '@/hooks/useProfile'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { LogoUpload } from '@/components/profile/LogoUpload'
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'
import { supabase } from '@/integrations/supabase/client'
import { User, Bell, Shield, Palette, Save, Loader2, PenLine, Star, Gift, Lock, CheckCircle2 } from 'lucide-react'
import { SignatureUpload } from '@/components/profile/SignatureUpload'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import { SatisfactionSurveyDialog } from '@/components/survey/SatisfactionSurveyDialog'

const Configuracoes = () => {
  const { profile, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const updateProfile = useUpdateProfile()
  
  // Form states - inicializados com dados do profile
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [creci, setCreci] = useState('')
  const [imobiliaria, setImobiliaria] = useState('')
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [avaliacaoNotifications, setAvaliacaoNotifications] = useState(true)
  const [creditoNotifications, setCreditoNotifications] = useState(true)
  const [loadingPreferences, setLoadingPreferences] = useState(true)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)

  // Survey queries
  const { data: alreadyAnswered } = useQuery({
    queryKey: ['survey-answered', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('pesquisas_satisfacao')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return (count || 0) > 0
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const { data: evaluationsCount } = useQuery({
    queryKey: ['survey-eval-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('avaliacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return count || 0
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const hasEnoughEvals = (evaluationsCount ?? 0) >= 5
  const canRate = hasEnoughEvals && alreadyAnswered === false
  const remaining = Math.max(0, 5 - (evaluationsCount ?? 0))

  // Preencher campos quando profile carregar
  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '')
      setTelefone(profile.telefone || '')
      setCreci(profile.creci || '')
      setImobiliaria(profile.imobiliaria || '')
    }
  }, [profile])

  // Carregar preferências do banco
  useEffect(() => {
    if (!user) return

    const fetchPreferences = async () => {
      setLoadingPreferences(true)
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setEmailNotifications(data.email_notifications)
          setAvaliacaoNotifications(data.evaluation_notifications)
          setCreditoNotifications(data.credit_notifications)
        }
      } catch (err) {
        console.error('Erro ao carregar preferências:', err)
      } finally {
        setLoadingPreferences(false)
      }
    }

    fetchPreferences()
  }, [user])

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({
      nome: nome || null,
      telefone: telefone || null,
      creci: creci || null,
      imobiliaria: imobiliaria || null,
    })
  }

  const handleSavePreferences = async () => {
    if (!user) return

    setSavingPreferences(true)
    try {
      // Upsert: insere ou atualiza
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          evaluation_notifications: avaliacaoNotifications,
          credit_notifications: creditoNotifications,
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      toast.success('Preferências salvas com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar preferências:', err)
      toast.error('Erro ao salvar preferências')
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleSaveAll = async () => {
    await Promise.all([
      handleSaveProfile(),
      handleSavePreferences()
    ])
  }

  const isSaving = updateProfile.isPending || savingPreferences

  return (
    <DashboardLayout title="Configurações" subtitle="Gerencie seu perfil e preferências">
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-10 sm:w-10">
                <User className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Informações do Perfil</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Atualize suas informações pessoais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center pb-2 sm:pb-4">
              <AvatarUpload
                currentUrl={profile?.avatar_url}
                name={profile?.nome}
                email={profile?.email}
                size="lg"
              />
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="h-10 bg-muted text-sm"
                />
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  O e-mail não pode ser alterado
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs sm:text-sm">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-xs sm:text-sm">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creci" className="text-xs sm:text-sm">CRECI</Label>
                <Input
                  id="creci"
                  placeholder="Ex: CE-12345"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Seu registro profissional
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imobiliaria" className="text-xs sm:text-sm">Imobiliária</Label>
                <Input
                  id="imobiliaria"
                  placeholder="Nome da sua imobiliária"
                  value={imobiliaria}
                  onChange={(e) => setImobiliaria(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <LogoUpload
                  currentUrl={profile?.logo_imobiliaria_url}
                  imobiliaria={imobiliaria}
                />
              </div>
            </div>

            <Separator />

            {/* Assinatura Digital */}
            <div className="pt-2">
              <SignatureUpload currentUrl={profile?.signature_url} />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="w-full sm:w-auto">
                {updateProfile.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Notificações</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configure como deseja receber notificações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs sm:text-sm">Notificações por e-mail</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Receba atualizações importantes por e-mail
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={loadingPreferences}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs sm:text-sm">Avaliações concluídas</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Receba notificação quando uma avaliação for concluída
                </p>
              </div>
              <Switch
                checked={avaliacaoNotifications}
                onCheckedChange={setAvaliacaoNotifications}
                disabled={loadingPreferences}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs sm:text-sm">Créditos baixos</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Seja avisado quando seus créditos estiverem acabando
                </p>
              </div>
              <Switch
                checked={creditoNotifications}
                onCheckedChange={setCreditoNotifications}
                disabled={loadingPreferences}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-10 sm:w-10">
                <Palette className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Aparência</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Personalize a interface do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs sm:text-sm">Modo escuro</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Ative o tema escuro para reduzir o cansaço visual
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rate App Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10 sm:h-10 sm:w-10">
                <Star className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Avaliar o Avaluz</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Nos conte o que acha!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Sua opinião nos ajuda a melhorar. Responda e ganhe 5 créditos!
            </p>
            {alreadyAnswered ? (
              <Button variant="outline" disabled className="w-full gap-2 sm:w-auto">
                <CheckCircle2 className="h-4 w-4" /> Já avaliado — obrigado!
              </Button>
            ) : !hasEnoughEvals ? (
              <Button variant="outline" disabled className="w-full gap-2 sm:w-auto">
                <Lock className="h-4 w-4" /> Faltam {remaining} avaliações
              </Button>
            ) : (
              <Button onClick={() => setShowSurvey(true)} className="w-full gap-2 sm:w-auto">
                <Gift className="h-4 w-4" /> Avaliar agora
              </Button>
            )}
          </CardContent>
        </Card>

        <SatisfactionSurveyDialog open={showSurvey} onClose={() => setShowSurvey(false)} />

        {/* Security Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-10 sm:w-10">
                <Shield className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Segurança</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gerencie a segurança da sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs sm:text-sm">Alterar senha</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Atualize sua senha de acesso
                </p>
              </div>
              <ChangePasswordDialog>
                <Button variant="outline" size="sm" className="h-9 flex-shrink-0">
                  Alterar
                </Button>
              </ChangePasswordDialog>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <Label className="text-xs text-destructive sm:text-sm">Excluir conta</Label>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Exclua permanentemente sua conta e todos os dados
                </p>
              </div>
              <DeleteAccountDialog>
                <Button variant="destructive" size="sm" className="h-9 flex-shrink-0">
                  Excluir
                </Button>
              </DeleteAccountDialog>
            </div>
          </CardContent>
        </Card>

        {/* Save All Button */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSaveAll} disabled={isSaving} size="lg" className="w-full sm:w-auto">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Todas as Alterações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Configuracoes
