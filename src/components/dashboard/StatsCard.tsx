import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  onClick?: () => void
  linkHint?: string
}

export const StatsCard = ({ title, value, icon, subtitle, trend, className, onClick, linkHint }: StatsCardProps) => {
  return (
    <Card 
      className={cn(
        'transition-shadow hover:shadow-md', 
        className,
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1 lg:space-y-2">
            <p className="whitespace-nowrap text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs lg:text-sm">
              {title}
            </p>
            <p className="whitespace-nowrap text-sm font-bold text-foreground sm:text-base lg:text-xl tabular-nums">
              {value}
            </p>
            {subtitle && !trend && (
              <p className="hidden text-xs text-primary sm:block lg:text-sm">
                {subtitle}
              </p>
            )}
            {trend && (
              <p
                className={cn(
                  'text-[10px] font-medium sm:text-xs lg:text-sm text-primary'
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {trend.value}% <span className="hidden lg:inline">em relação ao mês anterior</span>
              </p>
            )}
            {linkHint && (
              <p className="flex items-center gap-0.5 text-[10px] text-primary sm:text-xs">
                {linkHint} <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive sm:h-10 sm:w-10 lg:h-12 lg:w-12">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
