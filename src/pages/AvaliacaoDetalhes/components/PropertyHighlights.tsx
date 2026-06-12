import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, CheckCircle2, AlertCircle, TrendingUp, MapPin, Ruler } from 'lucide-react'

interface PropertyHighlightsProps {
  area?: number
  quartos?: number
  bairro?: string
  valorM2?: number
}

interface Insight {
  type: 'positive' | 'neutral' | 'attention'
  text: string
}

export const PropertyHighlights = ({ area, quartos, bairro, valorM2 }: PropertyHighlightsProps) => {
  // Generate dynamic insights based on property data
  const insights: Insight[] = []

  if (bairro) {
    insights.push({
      type: 'positive',
      text: `Localização em ${bairro} valoriza o imóvel`
    })
  }

  if (area && area >= 80) {
    insights.push({
      type: 'positive',
      text: 'Área acima da média para a categoria'
    })
  } else if (area && area < 50) {
    insights.push({
      type: 'neutral',
      text: 'Área compacta pode limitar público-alvo'
    })
  }

  if (quartos && quartos >= 3) {
    insights.push({
      type: 'positive',
      text: `${quartos} quartos atendem famílias maiores`
    })
  }

  if (valorM2 && valorM2 > 8000) {
    insights.push({
      type: 'attention',
      text: 'Valor/m² acima da média regional'
    })
  } else if (valorM2) {
    insights.push({
      type: 'positive',
      text: 'Valor/m² competitivo para a região'
    })
  }

  // Always add some default insights if needed
  if (insights.length < 3) {
    insights.push({
      type: 'neutral',
      text: 'Mercado imobiliário em estabilização'
    })
  }

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'attention':
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStyle = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-success/20 bg-success/5'
      case 'attention':
        return 'border-warning/20 bg-warning/5'
      default:
        return 'border-border bg-muted/30'
    }
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Lightbulb className="h-4 w-4 text-primary sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Insights da Avaliação</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Pontos relevantes sobre o imóvel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
        {insights.slice(0, 4).map((insight, index) => (
          <div 
            key={index}
            className={`flex items-start sm:items-center gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 ${getStyle(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5 sm:mt-0">
              {getIcon(insight.type)}
            </div>
            <span className="text-xs sm:text-sm leading-snug">{insight.text}</span>
          </div>
        ))}

        {/* Quick stats */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 sm:p-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Localização</p>
              <p className="text-xs sm:text-sm font-medium truncate">{bairro || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 sm:p-3 min-w-0">
            <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Área</p>
              <p className="text-xs sm:text-sm font-medium truncate">{area ? `${area} m²` : '-'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
