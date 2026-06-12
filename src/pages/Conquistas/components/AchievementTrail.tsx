import { useState, useMemo } from 'react';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import { CategorySection } from './CategorySection';
import { AchievementCard } from './AchievementCard';

interface AchievementTrailProps {
  achievements: (Achievement | TeamAchievement)[];
}

export function AchievementTrail({ achievements }: AchievementTrailProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const selectedAchievement = achievements.find(a => a.id === selectedId) || null;
  
  // Group achievements by category
  const categorizedAchievements = useMemo(() => {
    const grouped: Record<string, (Achievement | TeamAchievement)[]> = {};
    
    achievements.forEach(achievement => {
      const cat = achievement.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(achievement);
    });
    
    return grouped;
  }, [achievements]);
  
  // Define category order
  // Define category order with all categories
  const categoryOrder = [
    'avaliacoes', 'metas', 'valor', 'ranking', 'conversao', 
    'diversidade', 'feedback', 'membros', 'streak', 'velocidade', 
    'precisao', 'social'
  ];
  
  const sortedCategories = Object.keys(categorizedAchievements).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Categories Trail */}
      <div className="lg:col-span-2 space-y-4">
        {sortedCategories.map(category => (
          <CategorySection
            key={category}
            category={category}
            achievements={categorizedAchievements[category]}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
      
      {/* Selected Achievement Details */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <AchievementCard achievement={selectedAchievement} />
          
          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-team-border bg-team-card p-3 text-center">
              <p className="text-2xl font-bold text-team-orange">
                {achievements.filter(a => a.isUnlocked).length}
              </p>
              <p className="text-xs text-team-muted">Conquistadas</p>
            </div>
            <div className="rounded-lg border border-team-border bg-team-card p-3 text-center">
              <p className="text-2xl font-bold text-team-foreground">
                {achievements.filter(a => !a.isUnlocked).length}
              </p>
              <p className="text-xs text-team-muted">Restantes</p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 rounded-lg border border-team-border bg-team-card p-3">
            <p className="text-xs font-medium text-team-muted mb-2">Legenda</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-team-orange to-amber-500" />
                <span className="text-team-foreground">Conquistada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-team-accent border border-team-orange/50 animate-glow-slow" />
                <span className="text-team-foreground">Próxima</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-team-accent/50 border border-team-border opacity-50" />
                <span className="text-team-foreground">Bloqueada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}