import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GoalProgress {
  has_team: boolean;
  has_goal: boolean;
  goal: number | null;
  current: number;
  progress: number;
  month: string;
}

export function useUserMonthlyGoal() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-monthly-goal', user?.id],
    queryFn: async (): Promise<GoalProgress> => {
      if (!user) {
        return {
          has_team: false,
          has_goal: false,
          goal: null,
          current: 0,
          progress: 0,
          month: new Date().toISOString().slice(0, 10),
        };
      }

      const { data, error } = await supabase.rpc('get_user_goal_progress');

      if (error) {
        console.error('Error fetching goal progress:', error);
        throw error;
      }

      return data as unknown as GoalProgress;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getProgressLabel(progress: number): string {
  if (progress >= 100) return 'Meta atingida! 🎉';
  if (progress >= 70) return 'Quase lá!';
  if (progress >= 30) return 'Em progresso';
  return 'Início do mês';
}
