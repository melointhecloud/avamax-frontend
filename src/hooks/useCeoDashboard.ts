import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

interface CeoDashboardByFranchiseItem {
  franchise_name: string;
  avaliacoes: number;
  captados: number;
}

interface CeoDashboardByTypeItem {
  tipo: string;
  quantidade: number;
}

interface CeoDashboardValueByTypeItem {
  tipo: string;
  quantidade: number;
  valor_total: number;
}

interface CeoDashboardStats {
  total_avaliacoes: number;
  avaliacoes_mes_atual: number;
  total_captados: number;
  valor_total_avaliado: number;
  total_corretores: number;
  total_visitas_mes: number;
  por_imobiliaria: CeoDashboardByFranchiseItem[];
  por_tipo: CeoDashboardByTypeItem[];
  valor_por_tipo: CeoDashboardValueByTypeItem[];
  captados_por_tipo: CeoDashboardByTypeItem[];
  corretores_por_imobiliaria: Array<Record<string, unknown>>;
  visitas_por_imobiliaria: Array<Record<string, unknown>>;
}

const emptyDashboardStats: CeoDashboardStats = {
  total_avaliacoes: 0,
  avaliacoes_mes_atual: 0,
  total_captados: 0,
  valor_total_avaliado: 0,
  total_corretores: 0,
  total_visitas_mes: 0,
  por_imobiliaria: [],
  por_tipo: [],
  valor_por_tipo: [],
  captados_por_tipo: [],
  corretores_por_imobiliaria: [],
  visitas_por_imobiliaria: [],
};

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toObjectArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    : [];
}

function normalizeDashboardStats(data: unknown): CeoDashboardStats {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return emptyDashboardStats;
  }

  const raw = data as Record<string, unknown>;
  const porImobiliaria = toObjectArray(raw.por_imobiliaria).map((item) => ({
    franchise_name: typeof item.franchise_name === 'string' ? item.franchise_name : 'Imobiliária',
    avaliacoes: toNumber(item.avaliacoes),
    captados: toNumber(item.captados),
  }));

  const porTipo = toObjectArray(raw.por_tipo).map((item) => ({
    tipo: typeof item.tipo === 'string' ? item.tipo : 'outro',
    quantidade: toNumber(item.quantidade),
  }));

  const valorPorTipo = toObjectArray(raw.valor_por_tipo).map((item) => ({
    tipo: typeof item.tipo === 'string' ? item.tipo : 'outro',
    quantidade: toNumber(item.quantidade),
    valor_total: toNumber(item.valor_total),
  }));

  const captadosPorTipo = toObjectArray(raw.captados_por_tipo).map((item) => ({
    tipo: typeof item.tipo === 'string' ? item.tipo : 'outro',
    quantidade: toNumber(item.quantidade),
  }));

  return {
    total_avaliacoes: toNumber(raw.total_avaliacoes),
    avaliacoes_mes_atual: toNumber(raw.avaliacoes_mes_atual),
    total_captados: toNumber(raw.total_captados),
    valor_total_avaliado: toNumber(raw.valor_total_avaliado),
    total_corretores: toNumber(raw.total_corretores),
    total_visitas_mes: toNumber(raw.total_visitas_mes),
    por_imobiliaria: porImobiliaria,
    por_tipo: porTipo,
    valor_por_tipo: valorPorTipo,
    captados_por_tipo: captadosPorTipo,
    corretores_por_imobiliaria: toObjectArray(raw.corretores_por_imobiliaria),
    visitas_por_imobiliaria: toObjectArray(raw.visitas_por_imobiliaria),
  };
}

export function useCeoDashboard(period: 'month' | '3months' | 'year' | 'all') {
  return useQuery<CeoDashboardStats>({
    queryKey: ['ceo-dashboard', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_ceo_dashboard_stats' as never,
        {
          p_period: period === 'all' ? null : period,
        } as never,
      );

      if (error) {
        console.error('Error fetching CEO dashboard data:', error);
        throw error;
      }

      return normalizeDashboardStats(data);
    },
  });
}
