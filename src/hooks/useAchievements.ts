import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { USER_ACHIEVEMENTS, AchievementDefinition, AchievementCategory } from '@/lib/achievements';

export interface AchievementStats {
  total_evaluations: number;
  total_value: number;
  total_conversions: number;
  total_feedbacks: number;
  categories_evaluated: number;
  goals_achieved: number;
  streak_days: number;
  daily_evaluations: number;
  weekly_evaluations: number;
  monthly_evaluations: number;
  avg_rating: number;
  perfect_ratings: number;
  shares_count: number;
  luxury_count: number;
  apt_count: number;
  house_count: number;
  land_count: number;
  unlocked_achievements: Array<{
    achievement_id: string;
    unlocked_at: string;
    progress: Record<string, unknown> | null;
  }>;
}

export interface Achievement extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: { current: number; target: number };
}

export function useAchievements() {
  return useQuery({
    queryKey: ['user-achievements'],
    queryFn: async (): Promise<{ achievements: Achievement[]; stats: AchievementStats }> => {
      const { data, error } = await supabase.rpc('get_user_achievement_stats');
      
      if (error) throw error;
      
      const stats = data as unknown as AchievementStats;
      const unlockedIds = new Set(stats.unlocked_achievements.map(a => a.achievement_id));
      
      // Map achievements with their current progress
      const achievements: Achievement[] = USER_ACHIEVEMENTS.map(def => {
        const unlocked = stats.unlocked_achievements.find(a => a.achievement_id === def.id);
        let current = 0;
        
        // Calculate progress based on category and specific achievement
        switch (def.category) {
          case 'avaliacoes':
            current = stats.total_evaluations;
            break;
          case 'metas':
            current = stats.goals_achieved || 0;
            break;
          case 'valor':
            if (def.id.startsWith('luxury_')) {
              current = stats.luxury_count || 0;
            } else {
              current = stats.total_value;
            }
            break;
          case 'conversao':
            current = stats.total_conversions;
            break;
          case 'feedback':
            current = stats.total_feedbacks;
            break;
          case 'diversidade':
            if (def.id === 'apt_expert') {
              current = stats.apt_count || 0;
            } else if (def.id === 'house_expert') {
              current = stats.house_count || 0;
            } else if (def.id === 'land_expert') {
              current = stats.land_count || 0;
            } else if (def.id === 'all_types') {
              current = stats.categories_evaluated;
            } else {
              current = stats.categories_evaluated;
            }
            break;
          case 'ranking':
            // Ranking is handled differently - position must be <= target
            current = 0; // Will be set from network leaderboard
            break;
          case 'streak':
            current = stats.streak_days || 0;
            break;
          case 'velocidade':
            if (def.id === 'fast_5' || def.id === 'fast_10') {
              current = stats.daily_evaluations || 0;
            } else if (def.id === 'weekly_20') {
              current = stats.weekly_evaluations || 0;
            } else if (def.id === 'monthly_50') {
              current = stats.monthly_evaluations || 0;
            }
            break;
          case 'precisao':
            if (def.id === 'rating_5' || def.id === 'perfect_10') {
              current = stats.perfect_ratings || 0;
            } else {
              // For avg rating achievements, check if avg_rating >= threshold
              current = stats.total_feedbacks || 0;
            }
            break;
          case 'social':
            current = stats.shares_count || 0;
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
  });
}

export function useUnlockAchievement() {
  const unlockAchievement = async (achievementId: string, progress?: Record<string, unknown>) => {
    const { error } = await supabase.rpc('unlock_user_achievement', {
      p_achievement_id: achievementId,
      p_progress: (progress || null) as unknown as undefined,
    });
    
    if (error) throw error;
    return true;
  };
  
  return { unlockAchievement };
}

// Helper to get achievements by category
export function getAchievementsByCategory(achievements: Achievement[]): Record<AchievementCategory, Achievement[]> {
  const categories: Record<AchievementCategory, Achievement[]> = {
    avaliacoes: [],
    metas: [],
    valor: [],
    ranking: [],
    conversao: [],
    diversidade: [],
    feedback: [],
    membros: [],
    streak: [],
    velocidade: [],
    precisao: [],
    social: [],
  };
  
  achievements.forEach(achievement => {
    if (categories[achievement.category]) {
      categories[achievement.category].push(achievement);
    }
  });
  
  return categories;
}
