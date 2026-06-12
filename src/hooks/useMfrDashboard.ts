import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FranchiseStat {
    franchise_id: string;
    franchise_name: string;
    avaliacoes: number;
    captados: number;
}

export interface TipoStat {
    tipo: string;
    quantidade: number;
}

export interface ValorPorTipo {
    tipo: string;
    quantidade: number;
    valor_total: number;
}

export interface CorretoresPorImobiliaria {
    franchise_id: string;
    franchise_name: string;
    total_corretores: number;
}

export interface VisitasPorImobiliaria {
    franchise_id: string;
    franchise_name: string;
    total_visitas: number;
}

export interface MfrDashboardStats {
    total_avaliacoes: number;
    avaliacoes_mes_atual: number;
    total_captados: number;
    valor_total_avaliado: number;
    total_corretores: number;
    total_visitas_mes: number;
    por_imobiliaria: FranchiseStat[];
    por_tipo: TipoStat[];
    valor_por_tipo: ValorPorTipo[];
    captados_por_tipo: TipoStat[];
    corretores_por_imobiliaria: CorretoresPorImobiliaria[];
    visitas_por_imobiliaria: VisitasPorImobiliaria[];
}

export function useMfrDashboard(period: string = 'month') {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['mfr-dashboard', profile?.mfr_id, period],
        queryFn: async (): Promise<MfrDashboardStats> => {
            if (!profile?.mfr_id) throw new Error('MFR não identificado');

            const { data, error } = await supabase.rpc('get_mfr_dashboard_stats', {
                p_mfr_id: profile.mfr_id,
                p_period: period,
            } as any);

            if (error) throw error;
            return data as unknown as MfrDashboardStats;
        },
        enabled: !!profile?.mfr_id,
        staleTime: 1000 * 60 * 3,
    });
}
