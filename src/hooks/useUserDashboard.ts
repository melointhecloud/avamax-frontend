import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface RecentEvaluation {
  id: string;
  address: string;
  date: string;
  value: string;
  valueNumber: number;
  status: 'concluído' | 'pendente';
  propertyType: string;
  confidence: 'alta' | 'média';
}

export interface PropertyTypeStats {
  apartamento: number;
  casa: number;
  terreno: number;
  comercial: number;
  outro: number;
}

export interface ValueRangeStats {
  ate300k: number;
  de300a600k: number;
  acima600k: number;
}

export interface UserDashboardStats {
  totalEvaluations: number;
  monthlyEvaluations: number;
  previousMonthEvaluations: number;
  averageValue: number;
  previousMonthAverageValue: number;
  totalValue: number;
  recentEvaluations: RecentEvaluation[];
  propertyTypeStats: PropertyTypeStats;
  valueRangeStats: ValueRangeStats;
}

export function useUserDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-dashboard', user?.id],
    queryFn: async (): Promise<UserDashboardStats> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const now = new Date();
      const startCurrentMonthDate = startOfMonth(now);
      const startPreviousMonthDate = startOfMonth(subMonths(now, 1));
      const endPreviousMonthDate = startCurrentMonthDate;

      const parseMoneyLike = (raw: unknown): number => {
        if (typeof raw === 'number') return raw;
        if (typeof raw !== 'string') return Number.NaN;

        let s = raw.trim();
        if (!s) return Number.NaN;

        s = s.replace(/R\$\s*/g, '').replace(/\s+/g, '');

        const hasComma = s.includes(',');
        const hasDot = s.includes('.');

        if (hasComma) {
          s = s.replace(/\./g, '').replace(',', '.');
        } else if (hasDot) {
          const parts = s.split('.');
          if (parts.length > 2) {
            const last = parts[parts.length - 1];
            if (/^\d{3}$/.test(last)) {
              s = parts.join('');
            } else {
              s = `${parts.slice(0, -1).join('')}.${last}`;
            }
          }
        }

        s = s.replace(/[^0-9.-]/g, '');

        const num = Number(s);
        return Number.isFinite(num) ? num : Number.NaN;
      };

      const toEstimatedValueNumber = (valorEstimado: unknown, minimo: unknown, maximo: unknown): number => {
        const veNum = parseMoneyLike(valorEstimado);
        if (!Number.isNaN(veNum) && veNum > 0) return veNum;

        const minNum = parseMoneyLike(minimo);
        const maxNum = parseMoneyLike(maximo);
        if (!Number.isNaN(minNum) && !Number.isNaN(maxNum) && minNum > 0 && maxNum > 0) return (minNum + maxNum) / 2;

        return 0;
      };

      const toEstimatedValueLabel = (value: number): string =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(value);

      const normalizePropertyType = (categoria: unknown, categoriaUpper: unknown): string => {
        const raw = categoria || categoriaUpper;
        if (!raw || typeof raw !== 'string') return 'outro';
        const normalized = raw.toLowerCase().trim();
        if (normalized.includes('apartamento') || normalized.includes('apto') || normalized.includes('cobertura')) return 'apartamento';
        if (normalized.includes('casa') || normalized.includes('residencial')) return 'casa';
        if (normalized.includes('terreno') || normalized.includes('lote')) return 'terreno';
        if (normalized.includes('comercial') || normalized.includes('sala') || normalized.includes('loja')) return 'comercial';
        return 'outro';
      };

      const startCurrentMonthIso = startCurrentMonthDate.toISOString();
      const startPreviousMonthIso = startPreviousMonthDate.toISOString();
      const endPreviousMonthIso = endPreviousMonthDate.toISOString();

      const [
        totalCountRes,
        currentMonthCountRes,
        previousMonthCountRes,
        recentRes,
        allEvaluationsRes,
        previousMonthValuesRes,
      ] = await Promise.all([
        supabase
          .from('avaliacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('avaliacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startCurrentMonthIso),
        supabase
          .from('avaliacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startPreviousMonthIso)
          .lt('created_at', endPreviousMonthIso),
        (supabase.from('avaliacoes') as any)
          .select(
            [
              'id',
              'created_at',
              'valor_estimado:resultado->>valor_estimado',
              'minimo:resultado->>minimo',
              'maximo:resultado->>maximo',
              'rua:input->>rua',
              'numero:input->>numero',
              'bairro:input->>bairro',
              'municipio:input->>municipio',
              'categoria:input->>categoria',
              'categoria_upper:input->>Categoria',
            ].join(',')
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        (supabase.from('avaliacoes') as any)
          .select(
            'valor_estimado:resultado->>valor_estimado,minimo:resultado->>minimo,maximo:resultado->>maximo,categoria:input->>categoria,categoria_upper:input->>Categoria'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(500),
        (supabase.from('avaliacoes') as any)
          .select(
            'valor_estimado:resultado->>valor_estimado,minimo:resultado->>minimo,maximo:resultado->>maximo'
          )
          .eq('user_id', user.id)
          .gte('created_at', startPreviousMonthIso)
          .lt('created_at', endPreviousMonthIso)
          .limit(100),
      ]);

      if (totalCountRes.error) throw totalCountRes.error;
      if (currentMonthCountRes.error) throw currentMonthCountRes.error;
      if (previousMonthCountRes.error) throw previousMonthCountRes.error;
      if (recentRes.error) throw recentRes.error;
      if (allEvaluationsRes.error) throw allEvaluationsRes.error;
      if (previousMonthValuesRes.error) throw previousMonthValuesRes.error;

      const totalEvaluations = totalCountRes.count ?? 0;
      const monthlyEvaluations = currentMonthCountRes.count ?? 0;
      const previousMonthEvaluations = previousMonthCountRes.count ?? 0;

      const allRows = (allEvaluationsRes.data ?? []) as Array<{
        valor_estimado?: unknown;
        minimo?: unknown;
        maximo?: unknown;
        categoria?: unknown;
        categoria_upper?: unknown;
      }>;

      const values = allRows
        .map((r) => toEstimatedValueNumber(r.valor_estimado, r.minimo, r.maximo))
        .filter((v) => v > 0);

      const totalValue = values.reduce((a, b) => a + b, 0);
      const averageValue = values.length > 0 ? totalValue / values.length : 0;

      // Previous month average
      const prevMonthRows = (previousMonthValuesRes.data ?? []) as Array<{
        valor_estimado?: unknown;
        minimo?: unknown;
        maximo?: unknown;
      }>;
      const prevMonthValues = prevMonthRows
        .map((r) => toEstimatedValueNumber(r.valor_estimado, r.minimo, r.maximo))
        .filter((v) => v > 0);
      const previousMonthAverageValue = prevMonthValues.length > 0 
        ? prevMonthValues.reduce((a, b) => a + b, 0) / prevMonthValues.length 
        : 0;

      // Property type stats
      const propertyTypeStats: PropertyTypeStats = {
        apartamento: 0,
        casa: 0,
        terreno: 0,
        comercial: 0,
        outro: 0,
      };

      allRows.forEach((row) => {
        const type = normalizePropertyType(row.categoria, row.categoria_upper);
        propertyTypeStats[type as keyof PropertyTypeStats]++;
      });

      // Value range stats
      const valueRangeStats: ValueRangeStats = {
        ate300k: 0,
        de300a600k: 0,
        acima600k: 0,
      };

      values.forEach((v) => {
        if (v <= 300000) {
          valueRangeStats.ate300k++;
        } else if (v <= 600000) {
          valueRangeStats.de300a600k++;
        } else {
          valueRangeStats.acima600k++;
        }
      });

      const recentRows = (recentRes.data ?? []) as Array<{
        id: number;
        created_at: string;
        valor_estimado?: unknown;
        minimo?: unknown;
        maximo?: unknown;
        rua?: string | null;
        numero?: string | null;
        bairro?: string | null;
        municipio?: string | null;
        categoria?: unknown;
        categoria_upper?: unknown;
      }>;

      const recentEvaluations: RecentEvaluation[] = recentRows.map((row) => {
        const addressParts = [row.rua, row.numero, row.bairro].filter(Boolean);
        const address = addressParts.length > 0 
          ? addressParts.join(', ')
          : 'Endereço não informado';

        const estimatedNumber = toEstimatedValueNumber(row.valor_estimado, row.minimo, row.maximo);
        const value = estimatedNumber > 0 ? toEstimatedValueLabel(estimatedNumber) : 'R$ 0';

        const dateObj = new Date(row.created_at);
        const date = Number.isNaN(dateObj.getTime()) ? '' : format(dateObj, 'dd/MM/yyyy');

        const propertyType = normalizePropertyType(row.categoria, row.categoria_upper);
        
        // Confidence based on value range (higher values = higher confidence in data quality)
        const confidence: 'alta' | 'média' = estimatedNumber > 100000 ? 'alta' : 'média';

        return {
          id: String(row.id),
          address,
          date,
          value,
          valueNumber: estimatedNumber,
          status: 'concluído' as const,
          propertyType,
          confidence,
        };
      });

      return {
        totalEvaluations,
        monthlyEvaluations,
        previousMonthEvaluations,
        averageValue,
        previousMonthAverageValue,
        totalValue,
        recentEvaluations,
        propertyTypeStats,
        valueRangeStats,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}