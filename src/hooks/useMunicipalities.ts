import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMunicipalities = (estado: string | undefined) => {
  return useQuery({
    queryKey: ['municipalities', estado],
    queryFn: async (): Promise<string[]> => {
      if (!estado) return [];

      const { data, error } = await supabase
        .from('bairros_por_municipio')
        .select('municipio')
        .eq('estado', estado)
        .order('municipio');

      if (error) {
        console.error('Error fetching municipalities:', error);
        return [];
      }

      // Deduplicate
      const unique = [...new Set(data.map(d => d.municipio))];
      return unique;
    },
    enabled: !!estado && estado.length === 2,
    staleTime: 1000 * 60 * 10,
  });
};
