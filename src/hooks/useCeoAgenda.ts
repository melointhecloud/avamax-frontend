import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';

import { supabase } from '@/integrations/supabase/client';
import { type TeamEvent } from '@/hooks/useTeamEvents';
import { type TeamNotice } from '@/hooks/useTeamNotices';
import { useTenant } from '@/contexts/TenantContext';

interface CeoAgendaData {
  events: TeamEvent[];
  notices: TeamNotice[];
}

export function useCeoAgenda(month: Date) {
  const tenant = useTenant();
  const systemAuthorName = `Sistema ${tenant.brandName}`;
  const monthStart = useMemo(() => startOfMonth(month).toISOString(), [month]);
  const monthEnd = useMemo(() => endOfMonth(month).toISOString(), [month]);

  return useQuery<CeoAgendaData>({
    queryKey: ['ceo-agenda', monthStart, monthEnd, systemAuthorName],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_ceo_agenda_events' as never,
        {
          p_month_start: monthStart,
          p_month_end: monthEnd,
        } as never,
      );

      if (error) {
        console.error('Error fetching CEO agenda:', error);
        throw error;
      }

      const rawEvents = Array.isArray(data) ? (data as TeamEvent[]) : [];

      const creatorIds = [...new Set(rawEvents.map((event) => event.created_by).filter(Boolean))];
      const assigneeIds = [...new Set(rawEvents.map((event) => event.assigned_to).filter(Boolean))] as string[];
      const profileIds = [...new Set([...creatorIds, ...assigneeIds])];

      const { data: profiles } = profileIds.length
        ? await supabase
            .from('profiles')
            .select('id, nome')
            .in('id', profileIds)
        : { data: [] as Array<{ id: string; nome: string | null }> };

      const events = rawEvents.map((event) => ({
        ...event,
        color: event.color || 'hsl(var(--primary))',
        creator_name: profiles?.find((profile) => profile.id === event.created_by)?.nome || systemAuthorName,
        assignee_name: profiles?.find((profile) => profile.id === event.assigned_to)?.nome || undefined,
      }));

      const notices = events
        .filter((event) => {
          const title = event.title?.toLowerCase() || '';
          const description = event.description?.toLowerCase() || '';
          return title.includes('aviso') || title.includes('comunicado') || description.includes('aviso') || description.includes('comunicado');
        })
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          created_at: event.created_at,
          created_by: event.created_by,
          color: event.color,
          creator_name: event.creator_name,
          start_at: event.start_at,
          end_at: event.end_at,
          image_url: null,
        }));

      return {
        events,
        notices,
      };
    },
  });
}
