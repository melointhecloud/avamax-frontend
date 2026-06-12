import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { invokeAuthenticatedEdgeFunction } from '@/lib/supabase-edge'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Users,
  Zap,
  Crown
} from 'lucide-react'
import { showError } from '@/lib/sonner'
import { STRIPE_PLANS } from '@/lib/stripe'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type PlanDetail = {
  name: string
  icon: typeof Zap
  colorClass: string
  bgColor: string
  credits: number
  features: string[]
  nextPlan?: {
    id: string
    name: string
  }
}

const planDetails: Record<string, PlanDetail> = {
  gratis: {
    name: 'Grátis',
    icon: Zap,
    colorClass: 'text-slate-600',
    bgColor: 'bg-slate-100',
    credits: 2,
    features: ['2 créditos por mês', 'Acesso básico'],
    nextPlan: { id: 'profissional', name: 'Profissional' }
  },
  profissional: {
    name: 'Profissional',
    icon: TrendingUp,
    colorClass: 'text-[#DF6009]',
    bgColor: 'bg-[#DF6009]/10',
    credits: 80,
    features: ['80 créditos por mês', 'Relatórios PDF', 'Suporte prioritário'],
    nextPlan: { id: 'broker', name: 'Broker' }
  },
  broker: {
    name: 'Broker',
    icon: Users,
    colorClass: 'text-primary',
    bgColor: 'bg-primary/10',
    credits: 500,
    features: ['500 créditos por mês', 'Até 8 corretores', 'Dashboard do time', 'Analytics básico'],
    nextPlan: { id: 'imobiliaria', name: 'Imobiliária' }
  },
  imobiliaria: {
    name: 'Imobiliária',
    icon: Crown,
    colorClass: 'text-green-600',
    bgColor: 'bg-green-100',
    credits: 1200,
    features: ['1.200 créditos por mês', 'Até 15 corretores', 'Analytics avançado', 'Suporte dedicado']
  }
}

const Assinatura = () => {
  const navigate = useNavigate()
  const { subscription, profile, user, refreshSubscription } = useAuth()
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const currentPlanKey = subscription.subscriptionTier || 'gratis'
  const currentPlan = planDetails[currentPlanKey] || planDetails.gratis
  const IconComponent = currentPlan.icon

  const isActive = subscription.isSubscribed
  const endDate = subscription.subscriptionEnd 
    ? new Date(subscription.subscriptionEnd)
    : null

  const handleOpenPortal = async () => {
    setLoadingPortal(true)
    try {
      const { data, error } = await invokeAuthenticatedEdgeFunction<{ url: string }>('customer-portal')

      if (error) return

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Erro ao abrir portal:', err)
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    try {
      await refreshSubscription()
    } finally {
      setRefreshing(false)
    }
  }

  const handleUpgrade = () => {
    navigate('/creditos')
  }

  return (
    <DashboardLayout title="Minha Assinatura" subtitle="Gerencie seu plano, pagamentos e configurações de cobrança">
      <div className="container max-w-4xl space-y-6">

        {/* Current Plan Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${currentPlan.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${currentPlan.colorClass}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {currentPlanKey === 'gratis' 
                      ? 'Plano gratuito com recursos básicos'
                      : `${currentPlan.credits} créditos por mês`
                    }
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshStatus}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Atualizar Status'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Features */}
            <div>
              <h4 className="text-sm font-medium mb-3">Recursos inclusos</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {currentPlan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Subscription Details */}
            {isActive && endDate && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Próxima cobrança</p>
                    <p className="text-sm text-muted-foreground">
                      {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Forma de pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      Gerenciado pelo Stripe
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {currentPlan.nextPlan && (
                <Button onClick={handleUpgrade} className="gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Fazer Upgrade para {currentPlan.nextPlan.name}
                </Button>
              )}
              
              {isActive && (
                <Button 
                  variant="outline" 
                  onClick={handleOpenPortal}
                  disabled={loadingPortal}
                  className="gap-2"
                >
                  {loadingPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Gerenciar no Stripe
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Credits Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Créditos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {profile?.credits ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                créditos restantes
              </p>
              <Button 
                variant="link" 
                className="px-0 mt-2"
                onClick={() => navigate('/creditos')}
              >
                Comprar mais créditos →
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">
                    {profile?.nome || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium">Precisa de ajuda?</h4>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com nosso suporte para dúvidas sobre sua assinatura
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/ajuda')}>
                Central de Ajuda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Assinatura
