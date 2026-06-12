import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, CalendarDays, Loader2 } from 'lucide-react'
import { useEvaluationsTimeline, type TimelineFilter } from '@/hooks/useEvaluationsTimeline'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const FILTER_OPTIONS: { value: TimelineFilter; label: string }[] = [
  { value: 'day', label: 'Diário (14d)' },
  { value: 'week', label: 'Semanal (12s)' },
  { value: 'month', label: 'Mensal (12m)' },
  { value: 'custom', label: 'Período' },
]

// Custom tooltip displayed on hover
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const { count, captados, periodStart, periodEnd } = payload[0]?.payload || {}

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {periodStart && periodEnd && (
        <p className="text-muted-foreground text-xs mb-1.5">
          {format(new Date(periodStart), "dd MMM yyyy", { locale: ptBR })}
          {' '}–{' '}
          {format(new Date(periodEnd), "dd MMM yyyy", { locale: ptBR })}
        </p>
      )}
      <p className="text-primary font-bold text-base">
        {count} {count === 1 ? 'avaliação' : 'avaliações'}
      </p>
      <p className="font-bold text-base" style={{ color: '#CC0000' }}>
        {captados ?? 0} {captados === 1 ? 'captado' : 'captados'}
      </p>
    </div>
  )
}

export const EvaluationsTimelineChart = () => {
  const [filter, setFilter] = useState<TimelineFilter>('month')
  const [customStart, setCustomStart] = useState<Date | undefined>()
  const [customEnd, setCustomEnd] = useState<Date | undefined>()
  const [customStartInput, setCustomStartInput] = useState('')
  const [customEndInput, setCustomEndInput] = useState('')

  const { data: points = [], isLoading } = useEvaluationsTimeline({
    filter,
    customStart,
    customEnd,
  })

  const totalInPeriod = points.reduce((sum, p) => sum + p.count, 0)
  const maxCount = Math.max(...points.map(p => Math.max(p.count, p.captados)), 1)

  const handleCustomApply = () => {
    const start = customStartInput ? new Date(customStartInput) : undefined
    const end = customEndInput ? new Date(customEndInput) : undefined
    if (start && !isNaN(start.getTime())) setCustomStart(start)
    if (end && !isNaN(end.getTime())) setCustomEnd(end)
  }

  return (
    <Card>
      <CardHeader className="px-3 pb-2 pt-3 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Avaliações ao Longo do Tempo
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5 flex items-center gap-3">
              {isLoading
                ? 'Carregando...'
                : `${totalInPeriod} ${totalInPeriod !== 1 ? 'avaliações' : 'avaliação'} no período`}
            </CardDescription>
            {!isLoading && (
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                  Avaliações
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#CC0000' }} />
                  Captados
                </span>
              </div>
            )}
          </div>

          {/* Filter buttons */}
          <div className="flex gap-1 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                size="sm"
                variant={filter === opt.value ? 'default' : 'outline'}
                className="h-7 px-2.5 text-[11px] sm:text-xs"
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {filter === 'custom' && (
          <div className="flex flex-wrap items-end gap-2 mt-3">
            <div className="space-y-1">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                className="h-7 text-xs w-36"
                value={customStartInput}
                onChange={e => setCustomStartInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                className="h-7 text-xs w-36"
                value={customEndInput}
                onChange={e => setCustomEndInput(e.target.value)}
              />
            </div>
            <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleCustomApply}>
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Aplicar
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-2 pb-4 sm:px-6">
        {isLoading ? (
          <div className="flex h-[180px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : points.length === 0 || totalInPeriod === 0 ? (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-xs text-muted-foreground">Nenhuma avaliação no período selecionado</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={points} margin={{ left: -20, right: 4, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="captadosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CC0000" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#CC0000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                domain={[0, Math.ceil(maxCount * 1.2)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Avaliações"
                fill="url(#evalGradient)"
                dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
              <Area
                type="monotone"
                dataKey="captados"
                stroke="#CC0000"
                strokeWidth={2}
                name="Captados"
                fill="url(#captadosGradient)"
                dot={{ r: 3, fill: '#CC0000', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#CC0000', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
