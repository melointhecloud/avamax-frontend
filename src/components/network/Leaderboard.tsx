import { Trophy, Medal, Award, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkLeaderboard } from '@/hooks/useNetworkLeaderboard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const getInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

const getBadgeIcon = (position: number) => {
  if (position === 1) {
    return (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-md shadow-yellow-500/30 ring-2 ring-card">
        <Trophy className="w-2.5 h-2.5 text-yellow-900" />
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-md shadow-gray-400/30 ring-2 ring-card">
        <Medal className="w-2.5 h-2.5 text-gray-700" />
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-md shadow-amber-600/30 ring-2 ring-card">
        <Award className="w-2.5 h-2.5 text-amber-200" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-card">
      {position}º
    </div>
  );
};

export const Leaderboard = () => {
  const { data, isLoading, error } = useNetworkLeaderboard(10);
  
  const currentUser = data?.current_user;
  const leaderboard = data?.leaderboard || [];
  
  return (
    <div className="rounded-xl border bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-destructive" />
              Top Corretores Avaluz
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ranking geral</p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {data?.total_users || 0} corretores
          </div>
        </div>
      </div>
      
      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Erro ao carregar ranking
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Nenhuma avaliação ainda
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map((player) => {
              const isTop3 = player.position <= 3;
              
              return (
                <div
                  key={player.position}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    isTop3 && 'bg-muted/50',
                    player.is_current_user && 'bg-primary/10 border-l-2 border-l-primary'
                  )}
                >
                  {/* Avatar with badge overlay */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={player.avatar_url || undefined} alt={player.display_name} />
                      <AvatarFallback className={cn(
                        'text-xs font-semibold',
                        isTop3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {getInitials(player.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge on bottom-right */}
                    <div className="absolute -bottom-1 -right-1">
                      {getBadgeIcon(player.position)}
                    </div>
                  </div>
                  
                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate text-sm',
                      isTop3 ? 'text-foreground' : 'text-foreground/80',
                      player.is_current_user && 'text-primary'
                    )}>
                      {player.display_name}
                      {player.is_current_user && <span className="text-xs ml-1 text-primary">(você)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {player.city}, {player.state}
                      {player.imobiliaria && (
                        <span className="text-muted-foreground/60"> • {player.imobiliaria}</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Evaluations count */}
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'font-bold tabular-nums',
                      player.position === 1 ? 'text-yellow-500' : 
                      player.position === 2 ? 'text-gray-400' :
                      player.position === 3 ? 'text-amber-500' :
                      'text-foreground/80'
                    )}>
                      {player.evaluations.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">avaliações</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Current user position (if not in top 10) */}
      {currentUser && currentUser.position > 10 && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold">
              #{currentUser.position}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Sua posição atual
              </p>
              <p className="text-xs text-muted-foreground">
                {currentUser.evaluations} avaliações no total
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-destructive font-medium">
                +{currentUser.evaluations_to_top_10} para Top 10
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* If user is in top 10, show a congratulations message */}
      {currentUser && currentUser.position <= 10 && (
        <div className="p-4 border-t bg-primary/5">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Parabéns! Você está no Top 10!
          </p>
        </div>
      )}
    </div>
  );
};
