import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeamSubscription } from './useTeamSubscription';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

export interface MemberAnalyticsData {
  member: {
    user_id: string;
    nome: string | null;
    email: string | null;
    avatar_url: string | null;
    creci: string | null;
    created_at: string;
    allocated_credits: number;
    is_owner: boolean;
  };
  stats: {
    total_avaliacoes: number;
    creditos_usados: number;
    convertidos: number;
    taxa_conversao: number;
    valor_total: number;
    valor_medio: number;
  };
  monthly_evolution: Array<{
    month_start: string;
    month_label: string;
    avaliacoes: number;
    convertidos: number;
    valor_medio: number;
  }>;
  category_distribution: Array<{
    categoria: string;
    count: number;
  }>;
  geographic_distribution: Array<{
    cidade: string;
    estado: string;
    count: number;
  }>;
  recent_evaluations: Array<{
    id: number;
    created_at: string;
    input: Record<string, unknown>;
    resultado: Record<string, unknown>;
    convertido: boolean;
  }>;
  team_comparison: {
    team_avg_avaliacoes: number;
    team_avg_conversao: number;
    member_rank: number;
    total_members: number;
  };
  error?: string;
}

export function useMemberAnalytics(memberId: string | undefined, period: AnalyticsPeriod = '30d') {
  const { teamData, planName } = useTeamSubscription();
  
  const isBrokerOrImobiliaria = planName === 'BROKER' || planName === 'IMOBILIARIA';
  const isImobiliaria = planName === 'IMOBILIARIA';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-analytics', teamData?.id, memberId, period],
    queryFn: async () => {
      if (!teamData?.id || !memberId) return null;

      const { data, error } = await supabase.rpc('get_member_analytics', {
        p_team_id: teamData.id,
        p_member_id: memberId,
        p_period: period
      });

      if (error) {
        console.error('Error fetching member analytics:', error);
        return null;
      }

      return data as unknown as MemberAnalyticsData;
    },
    enabled: !!teamData?.id && !!memberId && isBrokerOrImobiliaria,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    isBrokerOrImobiliaria,
    isImobiliaria,
    hasError: data?.error ? true : false,
    errorMessage: data?.error,
  };
}
