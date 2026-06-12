import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown, ChevronUp, Users, Sparkles, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateTeamDialog } from './CreateTeamDialog'
import { EnterpriseLeadDialog } from './EnterpriseLeadDialog'

const brokerFeatures = [
  'Até 8 pessoas no time',
  '500 créditos mensais compartilhados',
  'Fluxo de avaliações dos corretores',
  'Funil de vendas do time',
  'Painel de gestão centralizado',
  'Valor do imóvel + aluguel',
  'Bate-papo com IA especializada',
  'Histórico + suporte individualizado',
]

const imobiliariaFeatures = [
  'Tudo do plano Broker',
  'Até 15 pessoas no time',
  '1.200 créditos mensais',
  'Usuário avulso: R$ 47,90/mês',
  'Estudo de mercado + PDF profissional',
  'Painel de captações diárias',
  'Dashboard analytics avançado',
  'Suporte dedicado premium',
]

export function TeamPlansSection() {
  const [expandedBroker, setExpandedBroker] = useState(false)
  const [expandedImobiliaria, setExpandedImobiliaria] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [enterpriseOpen, setEnterpriseOpen] = useState(false)

  const visibleBrokerFeatures = expandedBroker ? brokerFeatures : brokerFeatures.slice(0, 4)
  const visibleImobiliariaFeatures = expandedImobiliaria ? imobiliariaFeatures : imobiliariaFeatures.slice(0, 4)

  return (
    <>
      <div className="relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A3F74]/95 via-[#0B1F33] to-[#0A3F74]/90" />
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#DF6009]/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#DF6009]/15 blur-3xl" />
        </div>

        <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#DF6009]/20 px-4 py-1.5">
              <Users className="h-4 w-4 text-[#DF6009]" />
              <span className="text-sm font-medium text-[#DF6009]">Planos para Times</span>
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Potencialize sua equipe
            </h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Gerencie avaliações de toda sua imobiliária em um só lugar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Broker Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#DF6009]/50 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(223,96,9,0.15)]">
              {/* Recommended badge */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2">
                <Badge className="gap-1 rounded-b-lg rounded-t-none border-0 bg-[#DF6009] px-4 py-1 text-white">
                  <Sparkles className="h-3 w-3" />
                  Recomendado
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DF6009]/20">
                    <Users className="h-6 w-6 text-[#DF6009]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Broker</h3>
                    <p className="text-sm text-white/60">Time pequeno</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">R$ 497,90</span>
                    <span className="text-white/60">/mês</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#DF6009]">500 créditos/mês</p>
                </div>

                <ul className="mt-6 space-y-3">
                  {visibleBrokerFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DF6009]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {brokerFeatures.length > 4 && (
                  <button
                    onClick={() => setExpandedBroker(!expandedBroker)}
                    className="mt-4 flex items-center gap-1 text-sm font-medium text-[#DF6009] transition-colors hover:text-[#DF6009]/80"
                  >
                    {expandedBroker ? (
                      <>
                        Ver menos <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Ver mais ({brokerFeatures.length - 4}) <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}

                <Button
                  onClick={() => setCreateTeamOpen(true)}
                  className="mt-6 w-full bg-[#DF6009] text-white hover:bg-[#DF6009]/90"
                  size="lg"
                >
                  Assinar Broker
                </Button>
              </div>
            </div>

            {/* Imobiliária Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Imobiliária</h3>
                  <p className="text-sm text-white/60">Equipe grande</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">R$ 997</span>
                  <span className="text-white/60">/mês</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-emerald-400">Até 1.200 créditos/mês</p>
                  <span 
                    className="cursor-help text-xs text-white/40"
                    title="Usuários avulsos por R$ 47,90/mês cada"
                  >
                    (avulsos R$ 47,9…)
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {visibleImobiliariaFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {imobiliariaFeatures.length > 4 && (
                <button
                  onClick={() => setExpandedImobiliaria(!expandedImobiliaria)}
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  {expandedImobiliaria ? (
                    <>
                      Ver menos <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Ver mais ({imobiliariaFeatures.length - 4}) <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              <Button
                onClick={() => setEnterpriseOpen(true)}
                className="mt-6 w-full bg-[#DF6009] text-white hover:bg-[#DF6009]/90"
                size="lg"
              >
                Assinar Imobiliária
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreateTeamDialog open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
      <EnterpriseLeadDialog open={enterpriseOpen} onOpenChange={setEnterpriseOpen} />
    </>
  )
}
