import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RankingType = 'avaliacoes' | 'captacao' | 'valor';

export interface RankedMember {
    user_id: string;
    nome: string | null;
    avatar_url: string | null;
    imobiliaria: string;
    total_avaliacoes: number;
    total_captados: number;
    valor_total: number;
    valor_captado_total: number;
    rank: number;
}

export function useMfrRankings(type: RankingType = 'avaliacoes') {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['mfr-rankings', profile?.mfr_id, type],
        queryFn: async (): Promise<RankedMember[]> => {
            if (!profile?.mfr_id) throw new Error('MFR não identificado');

            const { data, error } = await supabase.rpc('get_mfr_rankings', {
                p_mfr_id: profile.mfr_id,
                p_type: type,
            });

            if (error) throw error;
            return (data as unknown as RankedMember[]) || [];
        },
        enabled: !!profile?.mfr_id,
        staleTime: 1000 * 60 * 5,
    });
}
