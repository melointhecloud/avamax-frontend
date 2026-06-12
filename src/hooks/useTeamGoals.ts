import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TeamMemberGoal {
  user_id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  goal: number;
  current: number;
  progress: number;
  is_owner: boolean;
}

interface TeamGoalsOverview {
  month: string;
  members: TeamMemberGoal[];
}

export function useTeamGoals(teamId: string | null, month?: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const monthDate = month 
    ? new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const query = useQuery({
    queryKey: ['team-goals', teamId, monthDate],
    queryFn: async (): Promise<TeamGoalsOverview | null> => {
      if (!teamId || !user) return null;

      const { data, error } = await supabase.rpc('get_team_goals_overview', {
        p_team_id: teamId,
        p_month: monthDate,
      });

      if (error) {
        console.error('Error fetching team goals:', error);
        throw error;
      }

      return data as unknown as TeamGoalsOverview;
    },
    enabled: !!teamId && !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const upsertGoalMutation = useMutation({
    mutationFn: async ({
      userId,
      goal,
      goalMonth,
    }: {
      userId: string;
      goal: number;
      goalMonth?: string;
    }) => {
      if (!teamId) throw new Error('Team ID is required');

      const { data, error } = await supabase.rpc('upsert_member_goal', {
        p_team_id: teamId,
        p_user_id: userId,
        p_goal: goal,
        p_month: goalMonth || monthDate,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Erro ao definir meta');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-goals', teamId] });
      queryClient.invalidateQueries({ queryKey: ['user-monthly-goal'] });
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    upsertGoal: upsertGoalMutation.mutate,
    isUpdating: upsertGoalMutation.isPending,
  };
}
