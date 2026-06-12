import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardUser {
  position: number;
  display_name: string;
  imobiliaria: string;
  avatar_url: string | null;
  city: string;
  state: string;
  evaluations: number;
  is_current_user: boolean;
}

interface CurrentUserStats {
  position: number;
  evaluations: number;
  evaluations_to_top_10: number;
}

interface NetworkLeaderboardData {
  leaderboard: LeaderboardUser[];
  current_user: CurrentUserStats | null;
  total_users: number;
  active_today: number;
}

export const useNetworkLeaderboard = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['network-leaderboard', limit],
    queryFn: async (): Promise<NetworkLeaderboardData> => {
      const { data, error } = await supabase.rpc('get_network_leaderboard', {
        p_limit: limit,
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      return data as unknown as NetworkLeaderboardData;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
