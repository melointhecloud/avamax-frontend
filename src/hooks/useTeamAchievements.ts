import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TEAM_ACHIEVEMENTS, AchievementDefinition, AchievementCategory } from '@/lib/achievements';

export interface TeamAchievementStats {
  total_evaluations: number;
  total_value: number;
  member_count: number;
  goals_aligned_percent: number;
  goals_achieved_percent: number;
  streak_days: number;
  avg_rating: number;
  daily_evaluations: number;
  unlocked_achievements: Array<{
    achievement_id: string;
    unlocked_at: string;
    progress: Record<string, unknown> | null;
  }>;
}

export interface TeamAchievement extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: { current: number; target: number };
}

export function useTeamAchievements(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-achievements', teamId],
    queryFn: async (): Promise<{ achievements: TeamAchievement[]; stats: TeamAchievementStats }> => {
      if (!teamId) throw new Error('Team ID required');
      
      const { data, error } = await supabase.rpc('get_team_achievement_stats', {
        p_team_id: teamId,
      });
      
      if (error) throw error;
      
      const stats = data as unknown as TeamAchievementStats;
      
      const unlockedIds = new Set(stats.unlocked_achievements.map(a => a.achievement_id));
      
      // Map achievements with their current progress
      const achievements: TeamAchievement[] = TEAM_ACHIEVEMENTS.map(def => {
        const unlocked = stats.unlocked_achievements.find(a => a.achievement_id === def.id);
        let current = 0;
        
        // Calculate progress based on category
        switch (def.category) {
          case 'avaliacoes':
            current = stats.total_evaluations;
            break;
          case 'valor':
            current = stats.total_value;
            break;
          case 'membros':
            current = stats.member_count;
            break;
          case 'metas':
            if (def.id === 'team_goals_aligned') {
              current = stats.goals_aligned_percent || 0;
            } else {
              current = stats.goals_achieved_percent || 0;
            }
            break;
          case 'streak':
            current = stats.streak_days || 0;
            break;
          case 'precisao':
            current = Math.round((stats.avg_rating || 0) * 10); // Convert 4.5 to 45
            break;
          case 'velocidade':
            current = stats.daily_evaluations || 0;
            break;
        }
        
        // Considerar conquistado se já está na tabela OU se current >= target
        const isAchieved = current >= def.target;
        
        return {
          ...def,
          isUnlocked: unlockedIds.has(def.id) || isAchieved,
          unlockedAt: unlocked?.unlocked_at,
          progress: { current, target: def.target },
        };
      });
      
      return { achievements, stats };
    },
    enabled: !!teamId,
  });
}

export function useUnlockTeamAchievement() {
  const unlockAchievement = async (teamId: string, achievementId: string, progress?: Record<string, unknown>) => {
    const { error } = await supabase.rpc('unlock_team_achievement', {
      p_team_id: teamId,
      p_achievement_id: achievementId,
      p_progress: (progress || null) as unknown as undefined,
    });
    
    if (error) throw error;
    return true;
  };
  
  return { unlockAchievement };
}

// Helper to get team achievements by category
export function getTeamAchievementsByCategory(achievements: TeamAchievement[]): Partial<Record<AchievementCategory, TeamAchievement[]>> {
  const categories: Partial<Record<AchievementCategory, TeamAchievement[]>> = {};
  
  achievements.forEach(achievement => {
    if (!categories[achievement.category]) {
      categories[achievement.category] = [];
    }
    categories[achievement.category]!.push(achievement);
  });
  
  return categories;
}
