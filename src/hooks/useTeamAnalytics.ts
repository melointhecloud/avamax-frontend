import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamSubscription } from './useTeamSubscription';

export type AnalyticsPeriod = '7d' | '15d' | '30d' | '90d' | '1y';

export interface MemberStat {
  user_id: string;
  nome: string | null;
  avatar_url: string | null;
  total_avaliacoes: number;
  creditos_usados: number;
  convertidos: number;
  taxa_conversao: number;
  valor_medio: number;
  valor_total: number;
}

export interface MonthlyEvolution {
  month_start: string;
  month_label: string;
  avaliacoes: number;
  creditos: number;
  convertidos: number;
}

export interface CategoryDistribution {
  categoria: string;
  count: number;
  valor_medio: number;
}

export interface GeographicDistribution {
  cidade: string;
  estado: string;
  count: number;
  valor_medio: number;
}

export interface RankingMember {
  user_id: string;
  nome: string | null;
  avatar_url: string | null;
  avaliacoes: number;
  valor_total: number;
  rank: number;
}

export interface AnalyticsTotals {
  total_avaliacoes: number;
  total_convertidos: number;
  taxa_conversao: number;
  valor_total: number;
  valor_medio: number;
  creditos_usados: number;
}

export interface TeamAnalyticsData {
  period: string;
  start_date: string;
  member_stats: MemberStat[];
  monthly_evolution: MonthlyEvolution[];
  category_distribution: CategoryDistribution[];
  geographic_distribution: GeographicDistribution[];
  totals: AnalyticsTotals;
  ranking: RankingMember[];
  error?: string;
}

export function useTeamAnalytics(period: AnalyticsPeriod = '30d') {
  const { user } = useAuth();
  const { teamData, planName } = useTeamSubscription();

  const isImobiliaria = planName === 'IMOBILIARIA';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['team-analytics', teamData?.id, period],
    queryFn: async () => {
      if (!teamData?.id) return null;

      const { data, error } = await supabase.rpc('get_team_analytics', {
        p_team_id: teamData.id,
        p_period: period
      });

      if (error) {
        console.error('Error fetching team analytics:', error);
        return null;
      }

      return data as unknown as TeamAnalyticsData;
    },
    enabled: !!user?.id && !!teamData?.id && isImobiliaria,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    isImobiliaria,
    hasError: data?.error ? true : false,
    errorMessage: data?.error,
  };
}
