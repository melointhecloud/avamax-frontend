import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, FileText, CreditCard, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTenantPrefix } from '@/hooks/useTenantPrefix'

const actions = [
  {
    icon: Search,
    label: 'Nova Avaliação',
    path: '/avaliar',
  },
  {
    icon: FileText,
    label: 'Ver Histórico',
    path: '/historico',
  },
  {
    icon: CreditCard,
    label: 'Comprar Créditos',
    path: '/creditos',
  },
  {
    icon: HelpCircle,
    label: 'Ajuda',
    path: '/ajuda',
  },
]

export const QuickActions = () => {
  const navigate = useNavigate()
  const p = useTenantPrefix()

  return (
    <Card>
      <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
          {actions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(p(action.path))}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border p-2 transition-all duration-200 hover:border-primary hover:shadow-md sm:gap-3 sm:p-3 lg:p-4"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                <action.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <span className="truncate text-xs font-semibold text-foreground sm:text-sm lg:text-base">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
