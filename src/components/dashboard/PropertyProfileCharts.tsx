import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Building2, DollarSign } from 'lucide-react'
import type { PropertyTypeStats, ValueRangeStats } from '@/hooks/useUserDashboard'

interface PropertyProfileChartsProps {
  propertyTypeStats: PropertyTypeStats
  valueRangeStats: ValueRangeStats
}

const propertyTypeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  outro: 'Outro',
}

const valueRangeLabels: Record<string, string> = {
  ate300k: 'Até R$ 300k',
  de300a600k: 'R$ 300k - 600k',
  acima600k: 'Acima R$ 600k',
}

// Category colors matching dashboard distribution chart
const COLORS = [
  'hsl(14 90% 55%)',    // Red/orange — apartamento
  'hsl(145 63% 42%)',   // Green — casa
  'hsl(270 60% 55%)',   // Purple — terreno
  'hsl(187 72% 50%)',   // Cyan/teal — cobertura
  'hsl(215 90% 55%)',   // Blue — comercial
]

const VALUE_RANGE_COLORS: Record<string, string> = {
  ate300k: 'hsl(145 63% 42%)',      // Green
  de300a600k: 'hsl(215 90% 55%)',   // Blue
  acima600k: 'hsl(38 80% 55%)',     // Gold
}

const CustomBarLabel = ({ x, y, width, value, total }: any) => {
  if (!value) return null
  const percentage = Math.round((value / total) * 100)
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
      fill="hsl(var(--foreground))"
    >
      {value} ({percentage}%)
    </text>
  )
}

export const PropertyProfileCharts = ({ propertyTypeStats, valueRangeStats }: PropertyProfileChartsProps) => {
  const propertyTypeData = Object.entries(propertyTypeStats)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: propertyTypeLabels[key] || key,
      value,
      key,
    }))
    .sort((a, b) => b.value - a.value)

  const valueRangeData = Object.entries(valueRangeStats)
    .map(([key, value]) => ({
      name: valueRangeLabels[key] || key,
      value,
      key,
    }))

  const totalPropertyTypes = Object.values(propertyTypeStats).reduce((a, b) => a + b, 0)
  const totalValueRanges = Object.values(valueRangeStats).reduce((a, b) => a + b, 0)

  const chartConfig = {
    value: {
      label: 'Quantidade',
      color: 'hsl(var(--primary))',
    },
  }

  if (totalPropertyTypes === 0 && totalValueRanges === 0) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Property Type Chart */}
      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Building2 className="h-4 w-4 text-destructive" />
            <span className="truncate">Avaliações por Tipo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {totalPropertyTypes > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {propertyTypeData.map((item, index) => {
                const percentage = Math.round((item.value / totalPropertyTypes) * 100)
                return (
                  <div key={item.key} className="space-y-1 sm:space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium tabular-nums">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:h-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground sm:py-8 sm:text-sm">
              Nenhuma avaliação realizada ainda
            </p>
          )}
        </CardContent>
      </Card>

      {/* Value Range Chart */}
      <Card>
        <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <DollarSign className="h-4 w-4 text-destructive" />
            <span className="truncate">Avaliações por Faixa de Valor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {totalValueRanges > 0 ? (
            <ChartContainer config={chartConfig} className="h-[180px] w-full sm:h-[220px]">
              <BarChart data={valueRangeData} margin={{ top: 24, right: 8, bottom: 4, left: 8 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48} label={<CustomBarLabel total={totalValueRanges} />}>
                  {valueRangeData.map((entry) => (
                    <Cell key={entry.key} fill={VALUE_RANGE_COLORS[entry.key] || 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground sm:py-8 sm:text-sm">
              Nenhuma avaliação realizada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}