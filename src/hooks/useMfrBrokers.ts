import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MfrBroker {
  user_id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  imobiliaria: string | null;
}

export function useMfrBrokers(mfrId: string | null) {
  return useQuery({
    queryKey: ['mfr-brokers', mfrId],
    queryFn: async () => {
      if (!mfrId) return [];

      // Get all franchise IDs in this MFR
      const { data: franchises, error: fErr } = await supabase
        .from('remax_franchises')
        .select('id')
        .eq('mfr_id', mfrId)
        .eq('active', true);

      if (fErr) throw fErr;
      if (!franchises || franchises.length === 0) return [];

      const franchiseIds = franchises.map(f => f.id);

      // Get all profiles linked to these franchises
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url, imobiliaria')
        .in('remax_franchise_id', franchiseIds);

      if (pErr) throw pErr;

      return (profiles || []).map(p => ({
        user_id: p.id,
        nome: p.nome,
        email: p.email,
        avatar_url: p.avatar_url,
        imobiliaria: p.imobiliaria,
      })) as MfrBroker[];
    },
    enabled: !!mfrId,
  });
}
