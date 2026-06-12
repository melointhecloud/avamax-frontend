import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export function useSurveyTrigger() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const { data: alreadyAnswered } = useQuery({
    queryKey: ['survey-answered', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('pesquisas_satisfacao')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return (count || 0) > 0
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const { data: evaluationsCount } = useQuery({
    queryKey: ['survey-eval-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('avaliacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return count || 0
    },
    enabled: !!user && alreadyAnswered === false,
    staleTime: 5 * 60 * 1000,
  })

  const shouldShow =
    !!user &&
    !dismissed &&
    alreadyAnswered === false &&
    (evaluationsCount ?? 0) >= 5

  return { shouldShow, dismiss: () => setDismissed(true) }
}
