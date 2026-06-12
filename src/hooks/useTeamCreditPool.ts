import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreditPoolData {
  monthly_credits: number;
  credit_balance: number;
  credit_limit: number;
  used_credits: number;
  distributed_credits: number;
  available_pool: number;
  remaining_credits: number;
}

export function useTeamCreditPool(teamId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-credit-pool', teamId],
    queryFn: async (): Promise<CreditPoolData | null> => {
      if (!teamId) return null;

      const { data, error } = await supabase.rpc('get_team_credit_pool', {
        p_team_id: teamId,
      });

      if (error) {
        console.error('Error fetching team credit pool:', error);
        toast.error(`Erro ao carregar pool: ${error.message}`);
        throw error;
      }

      if (!data || typeof data !== 'object') {
        return null;
      }

      const result = data as unknown as CreditPoolData & { error?: string };

      if (result.error) {
        console.error('RPC error:', result.error);
        toast.error(`Erro do servidor (Pool): ${result.error}`);
        return null;
      }

      return result;
    },
    enabled: !!teamId && !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}
