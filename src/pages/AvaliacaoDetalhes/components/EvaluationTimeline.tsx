import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle2, FileSearch, Calculator, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EvaluationTimelineProps {
  createdAt: string
  avaliacaoId: number
}

export const EvaluationTimeline = ({ createdAt, avaliacaoId }: EvaluationTimelineProps) => {
  const date = new Date(createdAt)
  
  const steps = [
    {
      icon: FileText,
      title: 'Dados recebidos',
      description: 'Informações do imóvel coletadas',
      time: format(date, "HH:mm", { locale: ptBR }),
      completed: true
    },
    {
      icon: FileSearch,
      title: 'Busca de comparativos',
      description: 'Imóveis similares identificados',
      time: format(new Date(date.getTime() + 5000), "HH:mm", { locale: ptBR }),
      completed: true
    },
    {
      icon: Calculator,
      title: 'Cálculo de valor',
      description: 'Algoritmo de precificação aplicado',
      time: format(new Date(date.getTime() + 10000), "HH:mm", { locale: ptBR }),
      completed: true
    },
    {
      icon: CheckCircle2,
      title: 'Avaliação concluída',
      description: `Relatório #${avaliacaoId} gerado`,
      time: format(new Date(date.getTime() + 15000), "HH:mm", { locale: ptBR }),
      completed: true
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          Linha do Tempo
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Etapas da avaliação em {format(date, "dd/MM/yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-2 h-[calc(100%-20px)] w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Icon circle */}
              <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                step.completed 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted bg-background text-muted-foreground'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{step.title}</p>
                  <span className="flex-shrink-0 font-mono text-xs text-muted-foreground">
                    {step.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
