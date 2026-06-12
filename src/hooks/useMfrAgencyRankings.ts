import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RankingType } from './useMfrRankings';

export interface RankedAgency {
    franchise_name: string;
    total_corretores: number;
    total_avaliacoes: number;
    total_captados: number;
    valor_total: number;
    valor_captado_total: number;
    rank: number;
}

export function useMfrAgencyRankings(type: RankingType = 'avaliacoes') {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['mfr-agency-rankings', profile?.mfr_id, type],
        queryFn: async (): Promise<RankedAgency[]> => {
            if (!profile?.mfr_id) throw new Error('MFR não identificado');

            const { data, error } = await supabase.rpc('get_mfr_agency_rankings' as any, {
                p_mfr_id: profile.mfr_id,
                p_type: type,
            });

            if (error) throw error;
            return (data as unknown as RankedAgency[]) || [];
        },
        enabled: !!profile?.mfr_id,
        staleTime: 1000 * 60 * 5,
    });
}
