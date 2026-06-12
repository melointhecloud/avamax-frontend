import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { geocodeAddress } from '@/services/geocoding.service';

interface HeatmapPoint {
  lat: number;
  lng: number;
  count: number;
  bairro: string;
  municipio: string;
  estado: string;
}

interface LocationGroup {
  bairro: string;
  municipio: string;
  estado: string;
  eval_count: number;
}

const GEO_CACHE_KEY = 'avaluz_heatmap_geocache';

function getGeoCache(): Record<string, { lat: number; lng: number }> {
  try {
    return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setGeoCache(cache: Record<string, { lat: number; lng: number }>) {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

async function geocodeLocations(locations: LocationGroup[]): Promise<HeatmapPoint[]> {
  const cache = getGeoCache();
  const points: HeatmapPoint[] = [];
  const toGeocode: { loc: LocationGroup; key: string }[] = [];

  for (const loc of locations) {
    const key = `${loc.bairro || ''}|${loc.municipio}|${loc.estado}`;
    if (cache[key]) {
      points.push({
        lat: cache[key].lat,
        lng: cache[key].lng,
        count: Number(loc.eval_count),
        bairro: loc.bairro || '',
        municipio: loc.municipio,
        estado: loc.estado,
      });
    } else {
      toGeocode.push({ loc, key });
    }
  }

  // Limit to 10 uncached locations (highest eval_count first)
  const limited = toGeocode
    .sort((a, b) => Number(b.loc.eval_count) - Number(a.loc.eval_count))
    .slice(0, 10);

  for (let i = 0; i < limited.length; i++) {
    const { loc, key } = limited[i];
    try {
      const result = await geocodeAddress(loc.bairro || '', loc.municipio, loc.estado);
      if (result) {
        cache[key] = { lat: result.lat, lng: result.lng };
        points.push({
          lat: result.lat,
          lng: result.lng,
          count: Number(loc.eval_count),
          bairro: loc.bairro || '',
          municipio: loc.municipio,
          estado: loc.estado,
        });
      }
    } catch {
      // skip failed geocoding
    }
    if (i < limited.length - 1) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  setGeoCache(cache);
  return points;
}

export function useEvaluationHeatmap() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['evaluation-heatmap', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_team_evaluation_locations', {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data || !Array.isArray(data) || data.length === 0) return [];

      const locations = data as unknown as LocationGroup[];
      return geocodeLocations(locations);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 30,
  });
}
