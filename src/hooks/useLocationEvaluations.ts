import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveEvaluationCoverUrl } from '@/services/evaluation-images.service';

export interface LocationEvaluation {
  eval_id: number;
  eval_user_id: string;
  created_at: string;
  input: Record<string, any>;
  resultado: Record<string, any>;
  author_name: string | null;
  author_avatar: string | null;
  cover_url: string | null;
}

export function useLocationEvaluations(bairro: string, municipio: string, estado: string) {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);

  const query = useQuery({
    queryKey: ['location-evaluations', bairro, municipio, estado],
    queryFn: async (): Promise<LocationEvaluation[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_evaluations_by_location', {
        p_user_id: user.id,
        p_bairro: bairro || '',
        p_municipio: municipio,
        p_estado: estado,
      });

      if (error) throw error;
      if (!data || !Array.isArray(data)) return [];

      const evals = data as unknown as LocationEvaluation[];

      // Resolve cover images for first 5
      const withCovers = await Promise.all(
        evals.map(async (ev, i) => {
          if (i >= 5) return { ...ev, cover_url: null };
          try {
            const url = await resolveEvaluationCoverUrl({
              userId: ev.eval_user_id,
              evaluationId: ev.eval_id,
              evaluationCreatedAt: ev.created_at,
            });
            return { ...ev, cover_url: url };
          } catch {
            return { ...ev, cover_url: null };
          }
        })
      );

      return withCovers;
    },
    enabled: enabled && !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  return { ...query, activate: () => setEnabled(true) };
}
