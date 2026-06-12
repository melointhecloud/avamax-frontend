import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamSubscription } from './useTeamSubscription';

export type EvaluationScope = 'mine' | 'team' | 'all';

export interface TeamEvaluation {
  id: number;
  created_at: string;
  input: {
    municipio?: string;
    estado?: string;
    bairro?: string;
    categoria?: string;
    area?: number;
    tipoAvaliacao?: 'venda' | 'aluguel';
  };
  resultado: {
    valor_estimado?: number;
    pdf_settings?: {
      market?: {
        valor_estimado?: number;
      };
    };
    pdf_settings_aluguel?: {
      market?: {
        valor_estimado?: number;
      };
    };
  };
  satisfacao: number | null;
  convertido: boolean | null;
  creditos_consumidos: number;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
}

export function useTeamEvaluations(scope: EvaluationScope = 'mine', limit: number = 50) {
  const { user } = useAuth();
  const { teamData } = useTeamSubscription();

  return useQuery({
    queryKey: ['team-evaluations', teamData?.id, scope, limit],
    queryFn: async () => {
      if (!teamData?.id) return [];

      const { data, error } = await supabase.rpc('get_team_evaluations', {
        p_team_id: teamData.id,
        p_user_id: user?.id,
        p_scope: scope,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching team evaluations:', error);
        return [];
      }

      return (data as unknown as TeamEvaluation[]) || [];
    },
    enabled: !!user?.id && !!teamData?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Helper to get the estimated value (edited or original)
export function getEvaluationValue(evaluation: TeamEvaluation): number | undefined {
  const isRental = evaluation.input?.tipoAvaliacao === 'aluguel';
  const resultado = evaluation.resultado;

  if (isRental) {
    const valorEditadoAluguel = resultado?.pdf_settings_aluguel?.market?.valor_estimado;
    if (valorEditadoAluguel) return valorEditadoAluguel;
    
    const valorVenda = resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado;
    return valorVenda ? Math.round(valorVenda * 0.005) : undefined;
  } else {
    return resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado;
  }
}
