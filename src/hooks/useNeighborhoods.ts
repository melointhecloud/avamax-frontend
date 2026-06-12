import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNeighborhoods = (municipio: string | undefined) => {
  return useQuery({
    queryKey: ['neighborhoods', municipio],
    queryFn: async (): Promise<string[]> => {
      if (!municipio) return [];
      
      const { data, error } = await supabase
        .from('bairros_por_municipio')
        .select('bairro')
        .eq('municipio', municipio)
        .order('bairro');
      
      if (error) {
        console.error('Error fetching neighborhoods:', error);
        return [];
      }
      
      return data.map(d => d.bairro);
    },
    enabled: !!municipio && municipio.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });
};

// Função auxiliar para encontrar correspondência de bairro
export const findNeighborhoodMatch = (
  viaCepBairro: string,
  neighborhoods: string[]
): string | null => {
  if (!viaCepBairro || neighborhoods.length === 0) return null;
  
  const normalizedViaCep = viaCepBairro.toLowerCase().trim();
  
  // Busca correspondência exata (case-insensitive)
  const exactMatch = neighborhoods.find(
    bairro => bairro.toLowerCase().trim() === normalizedViaCep
  );
  if (exactMatch) return exactMatch;
  
  // Busca correspondência parcial
  const partialMatch = neighborhoods.find(
    bairro => {
      const normalizedBairro = bairro.toLowerCase().trim();
      return normalizedBairro.includes(normalizedViaCep) ||
             normalizedViaCep.includes(normalizedBairro);
    }
  );
  
  return partialMatch || null;
};
