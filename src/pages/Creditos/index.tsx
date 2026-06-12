import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { invokeAuthenticatedEdgeFunction } from '@/lib/supabase-edge'
import { CreditCard, Zap, TrendingUp, CheckCircle2, Sparkles, Check, Crown, ArrowUpRight, Loader2, Settings, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showSuccess, showError } from '@/lib/sonner'
import { STRIPE_PLANS, STRIPE_CREDIT_PACKAGES } from '@/lib/stripe'
import { CreateTeamDialog } from '@/components/creditos/CreateTeamDialog'
import { EnterpriseLeadDialog } from '@/components/creditos/EnterpriseLeadDialog'
import { useUserCredits } from '@/hooks/useUserCredits'

// Helper to get plan details
const getPlanDetails = (planId: string | null) => {
  const planMap: Record<string, { name: string; color: string; nextPlan: string | null }> = {
    gratis: { name: 'Grátis', color: 'bg-slate-100 text-slate-700', nextPlan: 'profissional' },
    profissional: { name: 'Profissional', color: 'bg-[#DF6009]/10 text-[#DF6009]', nextPlan: 'broker' },
    broker: { name: 'Broker', color: 'bg-primary/10 text-primary', nextPlan: 'imobiliaria' },
    imobiliaria: { name: 'Imobiliária', color: 'bg-green-100 text-green-700', nextPlan: null },
  }
  return planMap[planId ?? 'gratis'] ?? planMap.gratis
}

// Planos de assinatura Avaluz - 4 planos em escadinha (do menor para o maior)
const subscriptionPlans = [
  {
    id: 'gratis' as const,
    name: 'Grátis',
    description: 'Para experimentar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: '',
    credits: '2 créditos',
    popular: false,
    isTeamPlan: false,
    buttonText: 'Começar grátis',
    buttonVariant: 'outline' as const,
    visibleFeatures: 2,
    features: [
      'Valor do imóvel',
      'Valor do aluguel',
    ],
  },
  {
    id: 'profissional' as const,
    name: 'Profissional',
    description: 'Para corretores ativos',
    monthlyPrice: 97,
    yearlyPrice: 997,
    period: '/mês',
    credits: '80 créditos/mês',
    popular: true,
    isTeamPlan: false,
    buttonText: 'Assinar Profissional',
    buttonVariant: 'default' as const,
    visibleFeatures: 4,
    features: [
      'Valor do imóvel + aluguel',
      'Estudo de mercado completo',
      'PDF profissional para clientes',
      'Bate-papo sobre imóvel com IA',
      'Projeção de valorização',
      'Histórico de avaliações',
      'Suporte prioritário',
      'Noticiário do mercado',
      'Grupo de network exclusivo',
      { text: 'Leitura de imagem na avaliação', badge: 'Breve' },
    ],
  },
  {
    id: 'broker' as const,
    name: 'Broker',
    description: 'Time pequeno',
    monthlyPrice: 497.9,
    yearlyPrice: 5799,
    period: '/mês',
    credits: '500 créditos/mês',
    popular: false,
    isTeamPlan: true,
    buttonText: 'Assinar Broker',
    buttonVariant: 'default' as const,
    visibleFeatures: 5,
    features: [
      'Tudo do plano Profissional',
      'Até 8 pessoas no time',
      '500 créditos compartilhados',
      'Painel de gestão centralizado',
      'Fluxo de avaliações dos corretores',
      'Funil de vendas do time',
      'Dashboard de métricas do time',
      'Bate-papo com IA especializada',
      'Relatórios de performance',
      'Histórico unificado do time',
      'Suporte individualizado',
      'Convites por e-mail',
    ],
  },
  {
    id: 'imobiliaria' as const,
    name: 'Imobiliária',
    description: 'Equipe grande',
    monthlyPrice: 997,
    yearlyPrice: 10997,
    period: '/mês',
    credits: 'Até 1.200 créditos',
    popular: false,
    isTeamPlan: true,
    buttonText: 'Assinar Imobiliária',
    buttonVariant: 'default' as const,
    visibleFeatures: 6,
    features: [
      'Tudo do plano Broker',
      'Até 15 pessoas no time',
      '1.200 créditos compartilhados',
      'Usuários avulsos: R$ 47,90/mês',
      'Estudo de mercado premium',
      'PDF profissional personalizado',
      'Painel de captações diárias',
      'Dashboard analytics avançado',
      'Relatórios gerenciais completos',
      'API de integração',
      'Exportação de dados em massa',
      'Treinamento personalizado',
      'Suporte dedicado premium',
      'Gerente de conta exclusivo',
      { text: 'White-label do PDF', badge: 'Breve' },
    ],
  },
]

// Pacotes de créditos avulsos
const creditPackages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    credits: 10,
    price: 29.9,
    pricePerCredit: 2.99,
    popular: false,
    description: 'Ideal para começar',
    features: ['10 avaliações', 'Relatórios PDF', 'Suporte por email'],
  },
  {
    id: 'profissional' as const,
    name: 'Profissional',
    credits: 30,
    price: 69.9,
    pricePerCredit: 2.33,
    popular: true,
    description: 'Mais popular',
    features: ['30 avaliações', 'Relatórios PDF', 'Suporte prioritário', 'Análise de mercado avançada'],
    savings: 20,
  },
  {
    id: 'empresarial' as const,
    name: 'Empresarial',
    credits: 100,
    price: 199.9,
    pricePerCredit: 2.0,
    popular: false,
    description: 'Para grandes volumes',
    features: [
      '100 avaliações',
      'Relatórios PDF personalizados',
      'Suporte dedicado',
      'API de integração',
      'Dashboard analytics',
    ],
    savings: 33,
  },
]

const Creditos = () => {
  const navigate = useNavigate()
  const { profile, subscription, user } = useAuth()
  const { data: userCredits } = useUserCredits()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [enterpriseOpen, setEnterpriseOpen] = useState(false)
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({})

  const handleSelectSubscription = async (planId: keyof typeof STRIPE_PLANS) => {
    if (planId === 'gratis') {
      showSuccess('Você já está no plano gratuito!')
      return
    }

    // Direct checkout links for team plans - add client_reference_id for webhook
    if (planId === 'broker') {
      const baseUrl = isYearly 
        ? 'https://buy.stripe.com/8wM14p4X51bIaCC4gpenS03'
        : 'https://buy.stripe.com/fZu00lctF3fQdKubgkenS01'
      const checkoutUrl = user?.id 
        ? `${baseUrl}?client_reference_id=${user.id}` 
        : baseUrl
      window.open(checkoutUrl, '_blank')
      return
    }

    if (planId === 'imobiliaria') {
      const baseUrl = isYearly 
        ? 'https://buy.stripe.com/fZucN7eBNdUu6i2dosenS02'
        : 'https://buy.stripe.com/00w7sNbpBeYyeOyeswenS00'
      const checkoutUrl = user?.id 
        ? `${baseUrl}?client_reference_id=${user.id}` 
        : baseUrl
      window.open(checkoutUrl, '_blank')
      return
    }

    const plan = STRIPE_PLANS[planId]
    if (!plan.priceId) {
      showError('Este plano não está disponível para assinatura online.')
      return
    }

    setLoadingPlan(planId)

    try {
      const { data, error } = await invokeAuthenticatedEdgeFunction<{ url: string }>('create-checkout', {
        body: { priceId: plan.priceId },
      })

      if (error) return

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Erro ao criar checkout:', err)
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleSelectPackage = async (packageId: keyof typeof STRIPE_CREDIT_PACKAGES) => {
    const pkg = STRIPE_CREDIT_PACKAGES[packageId]
    
    setLoadingPackage(packageId)

    try {
      const { data, error } = await invokeAuthenticatedEdgeFunction<{ url: string }>('create-payment', {
        body: { priceId: pkg.priceId, credits: pkg.credits },
      })

      if (error) return

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Erro ao criar pagamento:', err)
    } finally {
      setLoadingPackage(null)
    }
  }

  const handleManageSubscription = async () => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Determine current plan from subscription or profile
  const currentPlan = subscription.subscriptionTier ?? (profile?.plano as keyof typeof STRIPE_PLANS) ?? 'gratis'
  const planDetails = getPlanDetails(currentPlan)
  const currentPlanData = subscriptionPlans.find((p) => p.id === currentPlan)
  const nextPlanData = planDetails.nextPlan ? subscriptionPlans.find((p) => p.id === planDetails.nextPlan) : null

  return (
    <DashboardLayout title="Créditos" subtitle="Gerencie seu saldo e compre mais créditos">
      <div className="space-y-6 sm:space-y-10">
        {/* Current Plan */}
        <Card className="border-[#DF6009]/20 bg-gradient-to-br from-[#DF6009]/5 to-[#DF6009]/10">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#DF6009]/20 sm:h-16 sm:w-16">
                  <Crown className="h-6 w-6 text-[#DF6009] sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground sm:text-sm">Seu plano atual</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <p className="text-xl font-bold text-foreground sm:text-2xl">{planDetails.name}</p>
                    <Badge className={cn('text-xs', planDetails.color)}>{currentPlanData?.credits}</Badge>
                  </div>
                  {currentPlanData && currentPlanData.monthlyPrice > 0 && (
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {formatCurrency(currentPlanData.monthlyPrice)}{currentPlanData.period}
                    </p>
                  )}
                  {subscription.subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">
                      Renova em: {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {subscription.isSubscribed && (
                  <Button
                    onClick={() => navigate('/assinatura')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Gerenciar assinatura
                  </Button>
                )}
                {nextPlanData && (
                  <Button
                    onClick={() => handleSelectSubscription(nextPlanData.id)}
                    disabled={loadingPlan === nextPlanData.id}
                    className="gap-2 bg-[#DF6009] text-white hover:bg-[#DF6009]/90"
                  >
                    {loadingPlan === nextPlanData.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Fazer upgrade para {nextPlanData.name}
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
                {!nextPlanData && !subscription.isSubscribed && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-green-700 sm:px-4">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium">Você está no plano mais completo!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20 sm:h-16 sm:w-16">
                  <Zap className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">Saldo atual</p>
                  <p className="text-3xl font-bold text-foreground tabular-nums sm:text-4xl">
                    {userCredits?.available ?? profile?.credits ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm">créditos disponíveis</p>
                  {/* Show credit breakdown for team members */}
                  {userCredits?.source === 'team_allocated' && (userCredits.allocated_credits ?? 0) > 0 && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-[hsl(var(--sidebar-primary))]">
                        {userCredits.allocated_credits} do time
                      </span>
                      {userCredits.personal_credits > 0 && (
                        <>
                          <span className="text-muted-foreground">+</span>
                          <span className="text-muted-foreground">
                            {userCredits.personal_credits} pessoais
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:text-sm md:text-right">
                <div className="flex items-center gap-2 md:justify-end">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>1 crédito = 1 avaliação completa</span>
                </div>
                <p>Os créditos não expiram</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans - Escadinha */}
        <div>
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Planos Avaluz</h2>
            <div className="flex items-center gap-3 rounded-full bg-muted/50 p-1 px-3">
              <Label 
                htmlFor="billing-toggle" 
                className={cn(
                  "cursor-pointer text-sm font-medium transition-colors",
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Mensal
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label 
                htmlFor="billing-toggle" 
                className={cn(
                  "cursor-pointer text-sm font-medium transition-colors",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Anual
                <Badge className="ml-2 bg-green-100 text-green-700 text-[10px]">Economize até 17%</Badge>
              </Label>
            </div>
          </div>
          
          {/* Escadinha crescente - cards maiores para planos melhores */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:items-end">
            {subscriptionPlans.map((plan, index) => {
              const isCurrentPlan = plan.id === currentPlan
              const isLoading = loadingPlan === plan.id
              const isExpanded = expandedPlans[plan.id] || false
              
              const handlePlanClick = () => {
                if (plan.id === 'broker') {
                  const baseUrl = isYearly 
                    ? 'https://buy.stripe.com/8wM14p4X51bIaCC4gpenS03'
                    : 'https://buy.stripe.com/fZu00lctF3fQdKubgkenS01'
                  const checkoutUrl = user?.id 
                    ? `${baseUrl}?client_reference_id=${user.id}` 
                    : baseUrl
                  window.open(checkoutUrl, '_blank')
                } else if (plan.id === 'imobiliaria') {
                  const baseUrl = isYearly 
                    ? 'https://buy.stripe.com/fZucN7eBNdUu6i2dosenS02'
                    : 'https://buy.stripe.com/00w7sNbpBeYyeOyeswenS00'
                  const checkoutUrl = user?.id 
                    ? `${baseUrl}?client_reference_id=${user.id}` 
                    : baseUrl
                  window.open(checkoutUrl, '_blank')
                } else {
                  handleSelectSubscription(plan.id)
                }
              }
              
              const toggleExpand = () => {
                setExpandedPlans(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))
              }
              
              // Altura mínima crescente para cada plano (efeito escadinha)
              const minHeightClasses = [
                'lg:min-h-[280px]',  // Grátis - menor
                'lg:min-h-[340px]',  // Profissional
                'lg:min-h-[400px]',  // Broker
                'lg:min-h-[460px]',  // Imobiliária - maior
              ]
              
              const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, plan.visibleFeatures)
              const hasMoreFeatures = plan.features.length > plan.visibleFeatures
              
              return (
                <div 
                  key={plan.id} 
                  className="flex flex-col"
                >
                  {/* Badge "Potencialize sua equipe" para planos de time */}
                  {plan.isTeamPlan && (
                    <div className="mb-2 flex items-center justify-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#DF6009]" />
                      <span className="text-xs font-medium text-[#DF6009]">Potencialize sua equipe</span>
                    </div>
                  )}
                  
                  <Card
                    className={cn(
                      'relative flex flex-col transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1',
                      minHeightClasses[index],
                      plan.popular && 'border-[#DF6009] shadow-lg ring-2 ring-[#DF6009]/20 hover:shadow-[#DF6009]/20',
                      isCurrentPlan && !plan.popular && 'border-green-500 ring-2 ring-green-500/20',
                      plan.isTeamPlan && 'border-[#0A3F74]/30 bg-gradient-to-b from-[#0A3F74]/5 to-transparent hover:shadow-[#0A3F74]/15'
                    )}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="gap-1 bg-green-500 text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Seu plano
                        </Badge>
                      </div>
                    )}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="gap-1 bg-[#DF6009] text-white">
                          <Sparkles className="h-3 w-3" />
                          Mais Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2 pt-6 text-center">
                      <CardTitle className="text-lg font-bold sm:text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-3">
                      {/* Price */}
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-xl font-bold text-foreground sm:text-2xl tabular-nums">
                            {(isYearly ? plan.yearlyPrice : plan.monthlyPrice) === 0 
                              ? 'R$ 0' 
                              : formatCurrency(isYearly ? plan.yearlyPrice : plan.monthlyPrice).replace('R$', 'R$ ')}
                          </span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isYearly ? '/ano' : plan.period}
                            </span>
                          )}
                        </div>
                        {isYearly && plan.monthlyPrice > 0 && (
                          <p className="mt-1 text-[10px] text-muted-foreground line-through">
                            {formatCurrency(plan.monthlyPrice * 12)}/ano
                          </p>
                        )}
                        <p className="mt-1 text-xs font-medium text-[#DF6009]">{plan.credits}</p>
                      </div>

                      {/* Features */}
                      <ul className="flex-1 space-y-1.5">
                        {visibleFeatures.map((feature, idx) => {
                          const isObject = typeof feature === 'object'
                          const text = isObject ? feature.text : feature
                          const badge = isObject ? feature.badge : null

                          return (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                              <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#DF6009]" />
                              <span className="flex-1 leading-tight">
                                {text}
                                {badge && (
                                  <Badge variant="secondary" className="ml-1 text-[9px] bg-[#DF6009]/10 text-[#DF6009]">
                                    {badge}
                                  </Badge>
                                )}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                      
                      {/* Ver mais / Ver menos */}
                      {hasMoreFeatures && (
                        <button
                          onClick={toggleExpand}
                          className="flex items-center justify-center gap-1 text-[11px] font-medium text-[#DF6009] transition-colors hover:text-[#DF6009]/80"
                        >
                          {isExpanded ? (
                            <>
                              Ver menos <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Ver mais ({plan.features.length - plan.visibleFeatures}) <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Button */}
                      <Button
                        onClick={handlePlanClick}
                        variant={plan.buttonVariant}
                        disabled={isCurrentPlan || isLoading}
                        className={cn(
                          'w-full text-sm mt-auto',
                          plan.popular
                            ? 'bg-[#DF6009] text-white hover:bg-[#DF6009]/90'
                            : plan.isTeamPlan 
                              ? 'border-[#0A3F74] text-[#0A3F74] hover:bg-[#0A3F74]/10'
                              : 'border-primary text-primary hover:bg-primary/10'
                        )}
                        size="default"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isCurrentPlan ? (
                          'Plano atual'
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dialogs para planos de time */}
        <CreateTeamDialog open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
        <EnterpriseLeadDialog open={enterpriseOpen} onOpenChange={setEnterpriseOpen} />

        {/* Credit Packages */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground sm:mb-6 sm:text-xl">Pacotes de créditos avulsos</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {creditPackages.map((pkg) => {
              const isLoading = loadingPackage === pkg.id
              return (
              <Card
                key={pkg.id}
                className={cn(
                  'relative transition-all hover:shadow-lg',
                  pkg.popular && 'border-primary shadow-lg ring-2 ring-primary/20'
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      Mais popular
                    </Badge>
                  </div>
                )}
                {pkg.savings && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      -{pkg.savings}%
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-base sm:text-lg">{pkg.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {formatCurrency(pkg.pricePerCredit)} por crédito
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <CreditCard className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                    <span className="text-sm font-semibold text-foreground sm:text-base">{pkg.credits} créditos</span>
                  </div>

                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500 sm:h-4 sm:w-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    disabled={isLoading}
                    className={cn(
                      'w-full',
                      pkg.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    )}
                    size="lg"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comprar'}
                  </Button>
                </CardContent>
              </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground sm:text-base">Os créditos expiram?</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Não! Seus créditos nunca expiram e podem ser usados a qualquer momento.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground sm:text-base">Quais formas de pagamento são aceitas?</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Aceitamos cartões de crédito (Visa, Mastercard, Amex) e PIX.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground sm:text-base">Posso pedir reembolso?</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Sim! Oferecemos reembolso integral em até 7 dias após a compra, desde que os créditos não tenham sido
                utilizados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Creditos
