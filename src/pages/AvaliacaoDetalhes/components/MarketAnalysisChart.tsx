import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface MarketAnalysisChartProps {
  valorEstimado?: number
  valorM2?: number
  bairro?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}

export const MarketAnalysisChart = ({ valorEstimado, valorM2, bairro }: MarketAnalysisChartProps) => {
  if (!valorEstimado || !valorM2) return null

  // Simulated market comparison data
  const marketData = [
    { 
      name: 'Região', 
      valor: Math.round(valorM2 * 0.85),
      fill: 'hsl(var(--muted-foreground))'
    },
    { 
      name: bairro || 'Bairro', 
      valor: Math.round(valorM2 * 0.95),
      fill: 'hsl(var(--accent))'
    },
    { 
      name: 'Seu Imóvel', 
      valor: valorM2,
      fill: 'hsl(var(--primary))'
    },
    { 
      name: 'Premium', 
      valor: Math.round(valorM2 * 1.15),
      fill: 'hsl(var(--muted-foreground))'
    },
  ]

  const chartConfig = {
    valor: {
      label: "Valor/m²",
    },
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 text-primary sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Análise de Mercado</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Comparação do valor/m² com a região
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[180px] w-full sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={65}
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {marketData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm bg-primary flex-shrink-0" />
            <span className="text-muted-foreground">Seu Imóvel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm bg-accent flex-shrink-0" />
            <span className="text-muted-foreground">Média do Bairro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm bg-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Mercado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
