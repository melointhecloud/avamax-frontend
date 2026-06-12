import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Home, Building2, MapPin, Store, HelpCircle, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { RecentEvaluation } from '@/hooks/useUserDashboard'

interface RecentEvaluationsProps {
  evaluations: RecentEvaluation[]
}

const propertyTypeIcons: Record<string, typeof Home> = {
  apartamento: Building2,
  casa: Home,
  terreno: MapPin,
  comercial: Store,
  outro: HelpCircle,
}

const propertyTypeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  outro: 'Outro',
}

export const RecentEvaluations = ({ evaluations }: RecentEvaluationsProps) => {
  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
          <EmptyState
            icon={FileText}
            title="Nenhuma avaliação realizada ainda"
            className="py-4 sm:py-6 lg:py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Avaliações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="space-y-2 sm:space-y-3">
          {evaluations.map((evaluation) => {
            const PropertyIcon = propertyTypeIcons[evaluation.propertyType] || HelpCircle
            const propertyLabel = propertyTypeLabels[evaluation.propertyType] || 'Imóvel'
            
            return (
              <div
                key={evaluation.id}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5 transition-all hover:border-primary/30 hover:bg-muted/50 sm:gap-3 sm:p-3 lg:p-4"
              >
                {/* Top Row: Type & Address */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive sm:h-9 sm:w-9">
                    <PropertyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                      {propertyLabel}
                    </span>
                    <p className="truncate text-xs font-medium text-foreground sm:text-sm lg:text-base">{evaluation.address}</p>
                  </div>
                </div>

                {/* Bottom Row: Value, Status, Date */}
                <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground tabular-nums sm:text-base lg:text-lg">
                      {evaluation.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge
                      variant="default"
                      className="bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600 hover:bg-green-500/20 dark:text-green-400 sm:px-2 sm:text-xs"
                    >
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Concluído</span>
                      <span className="sm:hidden">OK</span>
                    </Badge>
                    <span className="text-[10px] text-muted-foreground sm:text-xs">{evaluation.date}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}