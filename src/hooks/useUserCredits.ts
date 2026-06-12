import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface UserCreditsData {
  source: 'team_pool' | 'team_allocated' | 'personal';
  available: number;
  allocated_credits?: number;
  personal_credits: number;
  is_owner: boolean;
  team_id: string | null;
  unallocated_pool?: number;
  credit_limit?: number;
}

export function useUserCredits() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_available_credits')
      if (error) throw error
      return data as unknown as UserCreditsData
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

export function useInvalidateUserCredits() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['user-credits'] })
  }
}
