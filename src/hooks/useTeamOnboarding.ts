import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamSubscription } from './useTeamSubscription';

export interface OnboardingStatus {
  team_id: string;
  profile_configured: boolean;
  first_member_invited: boolean;
  first_evaluation_done: boolean;
  credits_viewed: boolean;
  completed_at: string | null;
  all_complete: boolean;
}

export function useTeamOnboarding() {
  const { user } = useAuth();
  const { teamData } = useTeamSubscription();
  const queryClient = useQueryClient();

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['team-onboarding', teamData?.id],
    queryFn: async () => {
      if (!teamData?.id) return null;

      const { data, error } = await supabase.rpc('get_team_onboarding_status', {
        p_team_id: teamData.id
      });

      if (error) {
        console.error('Error fetching onboarding status:', error);
        return null;
      }

      return data as unknown as OnboardingStatus;
    },
    enabled: !!user?.id && !!teamData?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateStepMutation = useMutation({
    mutationFn: async (step: string) => {
      if (!teamData?.id) throw new Error('No team');

      const { data, error } = await supabase.rpc('update_team_onboarding', {
        p_team_id: teamData.id,
        p_step: step
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-onboarding', teamData?.id] });
    }
  });

  const markStepComplete = (step: 'profile_configured' | 'first_member_invited' | 'first_evaluation_done' | 'credits_viewed') => {
    updateStepMutation.mutate(step);
  };

  const completedSteps = status ? [
    status.profile_configured,
    status.first_member_invited,
    status.first_evaluation_done,
    status.credits_viewed
  ].filter(Boolean).length : 0;

  const totalSteps = 4;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return {
    status,
    isLoading,
    error,
    markStepComplete,
    isUpdating: updateStepMutation.isPending,
    completedSteps,
    totalSteps,
    progressPercentage,
    isComplete: status?.all_complete ?? false,
    showChecklist: status && !status.all_complete && !status.completed_at,
  };
}
