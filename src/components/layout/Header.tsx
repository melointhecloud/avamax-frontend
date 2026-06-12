import { HelpCircle, Menu, Moon, Settings, Sun, Target, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useNavigate } from 'react-router-dom'
import { NotificationsPopover } from './NotificationsPopover'
import { Progress } from '@/components/ui/progress'
import { useUserMonthlyGoal, getProgressColor } from '@/hooks/useUserMonthlyGoal'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  evaluationsCount?: number
}

export const Header = ({ title, subtitle, onMenuClick, evaluationsCount = 0 }: HeaderProps) => {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { data: goalData, isLoading: goalLoading } = useUserMonthlyGoal()

  // Use dynamic goal from team if available, otherwise fallback to static
  const hasTeamGoal = goalData?.has_team && goalData?.has_goal
  const goal = hasTeamGoal ? (goalData?.goal || 0) : 50
  const current = hasTeamGoal ? (goalData?.current || 0) : evaluationsCount
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0

  const progressColorClass = hasTeamGoal ? getProgressColor(progress) : 'bg-orange-500'

  return (
    <div className="sticky top-0 z-30">
      <header className="flex min-h-[56px] items-center justify-between border-b border-border bg-card px-4 py-2 sm:min-h-[64px] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate('/ajuda')}
            aria-label="Ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate('/configuracoes')}
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <NotificationsPopover />
        </div>
      </header>
      
      {/* Progress bar - Dynamic based on team goals */}
      <div className="bg-card border-b border-border px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <Target className={cn(
            "h-4 w-4 flex-shrink-0",
            progress >= 100 ? "text-green-500" : "text-orange-500"
          )} />
          <div className="flex-1">
            {goalLoading ? (
              <div className="h-2 bg-muted rounded-full animate-pulse" />
            ) : goalData?.has_team && !goalData?.has_goal ? (
              <p className="text-xs text-muted-foreground italic">
                Meta não definida pelo gestor
              </p>
            ) : (
              <Progress 
                value={progress} 
                className={cn("h-2 bg-muted", `[&>div]:${progressColorClass}`)}
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {progress >= 100 && <Check className="h-4 w-4 text-green-500" />}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {goalData?.has_team && !goalData?.has_goal 
                ? `${current} avaliações`
                : `${current}/${goal} avaliações`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}