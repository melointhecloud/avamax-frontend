import { Users, Target, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkLeaderboard } from '@/hooks/useNetworkLeaderboard';

export const GamificationStats = () => {
  const { data, isLoading } = useNetworkLeaderboard(10);
  
  const currentUser = data?.current_user;
  const activeToday = data?.active_today || 0;
  const userPosition = currentUser?.position || 0;
  const evaluationsToTop10 = currentUser?.evaluations_to_top_10 || 0;
  
  const stats = [
    {
      icon: Users,
      label: 'Corretores ativos hoje',
      value: isLoading ? '...' : activeToday.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Target,
      label: 'Sua posição',
      value: isLoading ? '...' : userPosition > 0 ? `#${userPosition}` : '-',
      suffix: 'no ranking geral',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: Flame,
      label: 'Para entrar no Top 10',
      value: isLoading ? '...' : userPosition <= 10 ? '🎉' : `+${evaluationsToTop10}`,
      suffix: userPosition <= 10 ? 'Você já está!' : 'avaliações',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: Star,
      label: 'Total de avaliações',
      value: isLoading ? '...' : (currentUser?.evaluations || 0).toString(),
      suffix: 'realizadas',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn('text-2xl font-bold', stat.color)}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xs text-muted-foreground/70">
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
