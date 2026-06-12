import { Progress } from '@/components/ui/progress';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface ProgressHeaderProps {
  achievements: (Achievement | TeamAchievement)[];
  totalValue: number;
  isTeam?: boolean;
}

export function ProgressHeader({ achievements, totalValue, isTeam = false }: ProgressHeaderProps) {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Calculate tier
  const getTier = () => {
    if (unlockedCount >= 20) return { name: 'Lenda', color: 'text-amber-400', bg: 'bg-amber-400/20' };
    if (unlockedCount >= 15) return { name: 'Mestre', color: 'text-purple-400', bg: 'bg-purple-400/20' };
    if (unlockedCount >= 10) return { name: 'Expert', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (unlockedCount >= 5) return { name: 'Ativo', color: 'text-green-400', bg: 'bg-green-400/20' };
    return { name: 'Iniciante', color: 'text-team-muted', bg: 'bg-team-accent' };
  };
  
  const tier = getTier();
  
  return (
    <div className="rounded-xl border border-team-border bg-team-card p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Title and Progress */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-team-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-team-orange" />
            {isTeam ? 'Conquistas do Time' : 'Minhas Conquistas'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm text-team-muted mb-1">
                <span>Progresso Geral</span>
                <span>{unlockedCount}/{totalCount}</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-3 bg-team-accent"
              />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-3">
          {/* Tier Badge */}
          <div className={`px-4 py-3 rounded-xl ${tier.bg} flex flex-col items-center justify-center min-w-[100px]`}>
            <Star className={`w-5 h-5 ${tier.color} mb-1`} />
            <span className={`text-sm font-bold ${tier.color}`}>{tier.name}</span>
            <span className="text-xs text-team-muted">{unlockedCount} conquistas</span>
          </div>
          
          {/* Total Value */}
          <div className="px-4 py-3 rounded-xl bg-team-accent flex flex-col items-center justify-center min-w-[120px]">
            <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
            <span className="text-sm font-bold text-team-foreground">{formatCurrency(totalValue)}</span>
            <span className="text-xs text-team-muted">valor avaliado</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-team-muted border-t border-team-border pt-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-team-orange to-amber-500" />
          <span>Conquistado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-team-accent border-2 border-team-orange/50 animate-pulse" />
          <span>Próximo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-team-accent/50 border-2 border-team-border opacity-50" />
          <span>Bloqueado</span>
        </div>
      </div>
    </div>
  );
}
