import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FranchiseOverview {
    franchise_id: string;
    franchise_name: string;
    team_id: string;
    active: boolean;
    total_corretores: number;
    total_avaliacoes: number;
    total_captados: number;
    valor_total_avaliado: number;
}

export function useMfrFranchises() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['mfr-franchises', profile?.mfr_id],
        queryFn: async (): Promise<FranchiseOverview[]> => {
            if (!profile?.mfr_id) throw new Error('MFR não identificado');

            const { data, error } = await supabase.rpc('get_mfr_franchises_overview', {
                p_mfr_id: profile.mfr_id,
            });

            if (error) throw error;
            return (data as unknown as FranchiseOverview[]) || [];
        },
        enabled: !!profile?.mfr_id,
        staleTime: 1000 * 60 * 5,
    });
}
