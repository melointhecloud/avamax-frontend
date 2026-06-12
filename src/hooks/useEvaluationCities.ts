import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EvaluationCity {
  city: string;
  state: string;
  lat: number;
  lng: number;
  evaluation_count: number;
  intensity: number;
}

export const useEvaluationCities = () => {
  return useQuery({
    queryKey: ['evaluation-cities'],
    queryFn: async (): Promise<EvaluationCity[]> => {
      const { data, error } = await supabase.rpc('get_evaluation_cities');
      
      if (error) {
        console.error('Error fetching evaluation cities:', error);
        return [];
      }
      
      return (data as unknown as EvaluationCity[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes
  });
};
