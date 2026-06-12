import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import { getCategoryLabel, getCategoryColor } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AchievementCardProps {
  achievement: Achievement | TeamAchievement | null;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  if (!achievement) {
    return (
      <div className="rounded-xl border border-team-border bg-team-card p-6 text-center">
        <p className="text-team-muted text-sm">
          Selecione uma conquista para ver os detalhes
        </p>
      </div>
    );
  }
  
  const { name, description, icon, category, isUnlocked, unlockedAt, progress } = achievement;
  const categoryColor = getCategoryColor(category);
  const progressPercent = Math.min(100, (progress.current / progress.target) * 100);
  
  // Considerar como conquistado se progress >= target (mesmo que isUnlocked seja false)
  const isEffectivelyUnlocked = isUnlocked || progress.current >= progress.target;
  
  const formatValue = (value: number, cat: string) => {
    if (cat === 'valor') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString('pt-BR');
  };
  
  return (
    <div
      className={cn(
        'rounded-xl border bg-team-card p-6 transition-all duration-300',
        isEffectivelyUnlocked ? 'border-team-orange/50 shadow-glow' : 'border-team-border'
      )}
    >
      {/* Icon and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl',
            isEffectivelyUnlocked ? 'bg-gradient-to-br from-team-orange to-amber-500' : 'bg-team-accent'
          )}
        >
          <span className={cn(!isEffectivelyUnlocked && 'grayscale opacity-50')}>{icon}</span>
        </div>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        >
          {getCategoryLabel(category)}
        </span>
      </div>
      
      {/* Name and Description */}
      <h3 className={cn(
        'text-lg font-bold mb-1',
        isEffectivelyUnlocked ? 'text-team-foreground' : 'text-team-muted'
      )}>
        {name}
      </h3>
      <p className="text-sm text-team-muted mb-4">{description}</p>
      
      {/* Progress */}
      {!isEffectivelyUnlocked && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-team-muted mb-1">
            <span>Progresso</span>
            <span>
              {formatValue(progress.current, category)} / {formatValue(progress.target, category)}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-team-accent"
          />
        </div>
      )}
      
      {/* Unlocked Date */}
      {isEffectivelyUnlocked && unlockedAt && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-team-muted">
            Conquistado em {format(new Date(unlockedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
      )}
      
      {/* Unlocked but no date (achieved via progress) */}
      {isEffectivelyUnlocked && !unlockedAt && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-team-muted">Conquistado!</span>
        </div>
      )}
      
      {/* Locked State */}
      {!isEffectivelyUnlocked && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-team-muted/50" />
          <span className="text-team-muted">
            {progressPercent >= 70 ? 'Quase lá!' : progressPercent > 0 ? 'Em progresso' : 'Bloqueada'}
          </span>
        </div>
      )}
    </div>
  );
}
