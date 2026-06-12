import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ChartPeriod = '1m' | '3m' | '6m' | '12m';

export interface TeamDashboardStats {
  total_avaliacoes: number;
  avaliacoes_mes_atual: number;
  avaliacoes_mes_anterior: number;
  total_convertidos: number;
  creditos_usados: number;
  chart_data: Array<{ name: string; current: number; month_date: string }>;
  recent_properties: Array<{
    id: number;
    address: string;
    description: string;
    value: number;
    image: string | null;
    created_at: string;
    convertido: boolean;
  }>;
  top_avaliacoes: Array<{
    id: number;
    name: string;
    price: number;
    date: string;
    convertido: boolean;
  }>;
  category_distribution: Array<{ name: string; value: number }>;
  location_stats: Array<{ city: string; count: number; value: number }>;
  team_info: { monthly_credits: number; seat_limit: number; name: string } | null;
}

export function useTeamDashboard(period: ChartPeriod = '6m') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-dashboard', user?.id, period],
    queryFn: async (): Promise<TeamDashboardStats> => {
      // 1. Buscar team_id do usuário
      const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user!.id)
        .single();

      // Se não for membro, verificar se é owner
      let teamId = member?.team_id;
      
      if (!teamId) {
        const { data: ownedTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', user!.id)
          .single();
        
        teamId = ownedTeam?.id;
      }

      if (!teamId) {
        throw new Error('Usuário não pertence a um time');
      }

      // 2. Chamar função RPC com período
      const { data, error } = await supabase
        .rpc('get_team_dashboard_stats', { p_team_id: teamId, p_period: period });

      if (error) throw error;
      
      return data as unknown as TeamDashboardStats;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
