import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import { AchievementNode } from './AchievementNode';
import { CategoryShareableCard } from './CategoryShareableCard';
import { getCategoryLabel, getCategoryColor, AchievementCategory } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface CategorySectionProps {
  category: string;
  achievements: (Achievement | TeamAchievement)[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isTeam?: boolean;
  teamName?: string;
}

export function CategorySection({ 
  category, 
  achievements, 
  selectedId, 
  onSelect,
  isTeam = false,
  teamName
}: CategorySectionProps) {
  const { profile } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const categoryLabel = getCategoryLabel(category as AchievementCategory);
  const categoryColor = getCategoryColor(category as AchievementCategory);
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  
  // Sort by tier then by unlock status
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    return 0;
  });
  
  // Split into rows for zig-zag (max 4 per row)
  const rows: (Achievement | TeamAchievement)[][] = [];
  const itemsPerRow = 4;
  for (let i = 0; i < sortedAchievements.length; i += itemsPerRow) {
    rows.push(sortedAchievements.slice(i, i + itemsPerRow));
  }
  
  const userName = profile?.nome || profile?.email || 'Usuário';
  
  return (
    <>
      <div className="rounded-xl border border-team-border bg-team-card overflow-hidden">
        {/* Category Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b border-team-border"
          style={{ backgroundColor: `${categoryColor}15` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{sortedAchievements[0]?.icon || '🏆'}</span>
            <h3 className="font-semibold text-team-foreground">{categoryLabel}</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-team-muted">{unlockedCount}/{totalCount}</span>
              <div className="w-16 h-2 rounded-full bg-team-accent overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(unlockedCount / totalCount) * 100}%`,
                    backgroundColor: categoryColor 
                  }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-team-muted hover:text-team-orange hover:bg-team-accent"
              onClick={() => setIsShareOpen(true)}
              title="Compartilhar categoria"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Zig-Zag Trail */}
        <div className="p-4 relative">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {/* Achievement Row */}
              <div
                className={cn(
                  'flex items-center gap-3 md:gap-6 py-3',
                  rowIndex % 2 === 1 ? 'flex-row-reverse' : 'flex-row',
                  rowIndex % 2 === 1 ? 'pr-0 pl-8 md:pl-16' : 'pl-0 pr-8 md:pr-16'
                )}
              >
                {row.map((achievement, nodeIndex) => (
                  <div key={achievement.id} className="flex items-center">
                    <AchievementNode
                      achievement={achievement}
                      isSelected={selectedId === achievement.id}
                      onClick={() => onSelect(achievement.id)}
                      size="md"
                    />
                    
                    {/* Horizontal connector */}
                    {nodeIndex < row.length - 1 && (
                      <div
                        className={cn(
                          'w-6 md:w-10 h-0.5 mx-1',
                          achievement.isUnlocked && row[nodeIndex + 1]?.isUnlocked
                            ? 'bg-team-orange'
                            : 'bg-team-border'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Vertical connector to next row (zig-zag) */}
              {rowIndex < rows.length - 1 && (
                <svg
                  className="absolute w-full h-8 pointer-events-none"
                  style={{ 
                    top: '100%',
                    transform: 'translateY(-16px)'
                  }}
                >
                  {/* Diagonal connector line */}
                  <path
                    d={rowIndex % 2 === 0 
                      ? `M ${row.length * 70 + 20} 0 Q ${row.length * 70 + 40} 16, ${row.length * 70 + 60} 32`
                      : `M 60 0 Q 40 16, 20 32`
                    }
                    fill="none"
                    stroke="hsl(215 30% 18%)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Share Dialog */}
      <CategoryShareableCard
        category={category as AchievementCategory}
        achievements={achievements}
        userName={userName}
        isTeam={isTeam}
        teamName={teamName}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
}
