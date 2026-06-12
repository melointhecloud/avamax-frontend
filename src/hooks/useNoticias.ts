import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Noticia {
  id: number;
  titulo: string | null;
  descricao: string | null;
  image: string | null;
  link: string | null;
  data_noticia: string | null;
  created_at: string;
  source?: string | null;
}

interface NoticiasResponse {
  user_id: string;
  ultimas_30: {
    total: number;
    noticias: Noticia[];
  };
  ultimas_5: {
    total: number;
    noticias: Noticia[];
  };
}

function parseNoticiaDate(dateStr: string | null): number {
  if (!dateStr) return 0;
  // Handle DD/MM/YYYY
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return new Date(+brMatch[3], +brMatch[2] - 1, +brMatch[1]).getTime();
  }
  // Handle ISO / other formats
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? 0 : ts;
}

export const useNoticias = () => {
  return useQuery({
    queryKey: ['noticias'],
    queryFn: async (): Promise<Noticia[]> => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return [];
      }

      // Fetch both sources in parallel
      const [gnewsResult, legacyResult] = await Promise.allSettled([
        fetchGNews(session.access_token),
        fetchLegacyNoticias(session.access_token),
      ]);

      const gnewsNoticias = gnewsResult.status === 'fulfilled' ? gnewsResult.value : [];
      const legacyNoticias = legacyResult.status === 'fulfilled' ? legacyResult.value : [];

      // Merge and sort by date descending
      const merged = [...gnewsNoticias, ...legacyNoticias];
      merged.sort((a, b) => parseNoticiaDate(b.data_noticia) - parseNoticiaDate(a.data_noticia));

      return merged;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    retry: false,
  });
};

async function fetchGNews(token: string): Promise<Noticia[]> {
  try {
    const { data, error } = await supabase.functions.invoke('gnews-fetch', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) {
      console.warn('[useNoticias] GNews edge function error:', error);
      return [];
    }

    return data?.noticias || [];
  } catch (err) {
    console.warn('[useNoticias] GNews fetch failed:', err);
    return [];
  }
}

async function fetchLegacyNoticias(token: string): Promise<Noticia[]> {
  try {
    const response = await fetch(
      'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/noticias-listar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[useNoticias] Legacy noticias returned', response.status);
      return [];
    }

    const data: NoticiasResponse = await response.json();
    return data.ultimas_30?.noticias || [];
  } catch (err) {
    console.warn('[useNoticias] Legacy noticias failed:', err);
    return [];
  }
}
