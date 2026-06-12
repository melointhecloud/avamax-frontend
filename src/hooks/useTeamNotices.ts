import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamNotice {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  color: string;
  creator_name?: string;
  image_url?: string | null;
  start_at?: string;
  end_at?: string;
}

export function useTeamNotices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-notices', user?.id],
    queryFn: async (): Promise<TeamNotice[]> => {
      if (!user) return [];

      const { data: memberData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      let teamId = memberData?.team_id;

      if (!teamId) {
        const { data: ownedTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        teamId = ownedTeam?.id;
      }

      if (!teamId) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await (supabase as any)
        .from('team_events')
        .select('*')
        .eq('team_id', teamId)
        .or(`scope.eq.GLOBAL,and(scope.eq.ASSIGNED,assigned_to.eq.${user.id})`)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const creatorIds = [...new Set((data || []).map((e: any) => e.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', creatorIds as string[]);

      return (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        created_at: event.created_at,
        created_by: event.created_by,
        color: event.color || '#3b82f6',
        creator_name: profiles?.find(p => p.id === event.created_by)?.nome || 'Gestor',
        image_url: event.image_url,
        start_at: event.start_at,
        end_at: event.end_at,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noticeId: string) => {
      const { error } = await (supabase as any)
        .from('team_events')
        .delete()
        .eq('id', noticeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-notices'] });
      queryClient.invalidateQueries({ queryKey: ['team-events'] });
    },
  });
}
