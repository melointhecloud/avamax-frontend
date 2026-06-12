import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfWeek,
  endOfMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type TimelineFilter = 'day' | 'week' | 'month' | 'custom'

export interface TimelinePoint {
  label: string
  count: number
  captados: number
  periodStart: string
  periodEnd: string
}

interface UseEvaluationsTimelineOptions {
  filter: TimelineFilter
  customStart?: Date
  customEnd?: Date
}

export function useEvaluationsTimeline({
  filter,
  customStart,
  customEnd,
}: UseEvaluationsTimelineOptions) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['evaluations-timeline', user?.id, filter, customStart?.toISOString(), customEnd?.toISOString()],
    queryFn: async (): Promise<TimelinePoint[]> => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const now = new Date()
      let rangeStart: Date
      let rangeEnd: Date = endOfDay(now)

      // Define the range based on filter
      if (filter === 'day') {
        // Last 14 days, grouped by day
        rangeStart = startOfDay(subDays(now, 13))
      } else if (filter === 'week') {
        // Last 12 weeks, grouped by week
        rangeStart = startOfWeek(subWeeks(now, 11), { locale: ptBR })
      } else if (filter === 'month') {
        // Last 12 months, grouped by month
        rangeStart = startOfMonth(subMonths(now, 11))
      } else {
        // Custom range
        rangeStart = startOfDay(customStart || subDays(now, 30))
        rangeEnd = endOfDay(customEnd || now)
      }

      const { data, error } = await (supabase.from('avaliacoes') as any)
        .select('created_at, convertido')
        .eq('user_id', user.id)
        .gte('created_at', rangeStart.toISOString())
        .lte('created_at', rangeEnd.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      const rows = (data || []) as { created_at: string; convertido: boolean | null }[]

      // Group by period
      if (filter === 'day' || (filter === 'custom' && (customEnd?.getTime() ?? now.getTime()) - (customStart?.getTime() ?? subDays(now, 30).getTime()) <= 1000 * 60 * 60 * 24 * 30)) {
        // Day grouping
        const days = eachDayOfInterval({ start: rangeStart, end: now })
        return days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayRows = rows.filter(r => r.created_at.startsWith(dayStr))
          return {
            label: format(day, 'dd/MM', { locale: ptBR }),
            count: dayRows.length,
            captados: dayRows.filter(r => r.convertido === true).length,
            periodStart: startOfDay(day).toISOString(),
            periodEnd: endOfDay(day).toISOString(),
          }
        })
      } else if (filter === 'week' || (filter === 'custom' && (customEnd?.getTime() ?? now.getTime()) - (customStart?.getTime() ?? subDays(now, 30).getTime()) <= 1000 * 60 * 60 * 24 * 90)) {
        // Week grouping
        const weeks = eachWeekOfInterval({ start: rangeStart, end: now }, { locale: ptBR })
        return weeks.map(weekStart => {
          const weekEnd = endOfWeek(weekStart, { locale: ptBR })
          const weekRows = rows.filter(r => {
            const d = new Date(r.created_at)
            return d >= weekStart && d <= weekEnd
          })
          return {
            label: `${format(weekStart, 'dd/MM', { locale: ptBR })}–${format(weekEnd, 'dd/MM', { locale: ptBR })}`,
            count: weekRows.length,
            captados: weekRows.filter(r => r.convertido === true).length,
            periodStart: weekStart.toISOString(),
            periodEnd: weekEnd.toISOString(),
          }
        })
      } else {
        // Month grouping
        const months = eachMonthOfInterval({ start: rangeStart, end: now })
        return months.map(monthStart => {
          const monthEnd = endOfMonth(monthStart)
          const monthRows = rows.filter(r => {
            const d = new Date(r.created_at)
            return d >= monthStart && d <= monthEnd
          })
          return {
            label: format(monthStart, 'MMM yy', { locale: ptBR }),
            count: monthRows.length,
            captados: monthRows.filter(r => r.convertido === true).length,
            periodStart: monthStart.toISOString(),
            periodEnd: monthEnd.toISOString(),
          }
        })
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}
