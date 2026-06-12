import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TeamEvent {
    id: string;
    team_id: string;
    created_by: string;
    assigned_to: string | null;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string;
    color: string;
    scope: 'PERSONAL' | 'GLOBAL' | 'ASSIGNED' | 'MFR';
    mfr_id: string | null;
    created_at: string;
    creator_name?: string;
    creator_avatar?: string;
    assignee_name?: string;
}

export interface CreateEventInput {
    team_id: string;
    title: string;
    description?: string;
    start_at: string;
    end_at: string;
    color?: string;
    scope: 'PERSONAL' | 'GLOBAL' | 'ASSIGNED' | 'MFR';
    assigned_to?: string | null;
    mfr_id?: string | null;
}

export interface UpdateEventInput {
    id: string;
    title?: string;
    description?: string | null;
    start_at?: string;
    end_at?: string;
    color?: string;
    scope?: 'PERSONAL' | 'GLOBAL' | 'ASSIGNED' | 'MFR';
    assigned_to?: string | null;
    mfr_id?: string | null;
}

export function useTeamEvents(teamId: string | null, month: Date, isOwner = false) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

    const query = useQuery({
        queryKey: ['team-events', teamId, startOfMonth.toISOString(), endOfMonth.toISOString(), user?.id, isOwner],
        queryFn: async () => {
            if (!teamId || !user) return [];

            let q = (supabase as any)
                .from('team_events')
                .select('*')
                .eq('team_id', teamId)
                .gte('start_at', startOfMonth.toISOString())
                .lte('start_at', endOfMonth.toISOString())
                .order('start_at', { ascending: true });

            if (!isOwner) {
                // Members only see: GLOBAL events, ASSIGNED events for them, PERSONAL events they created
                q = q.or(
                    `scope.eq.GLOBAL,and(scope.eq.ASSIGNED,assigned_to.eq.${user.id}),and(scope.eq.PERSONAL,created_by.eq.${user.id})`
                );
            }

            const { data, error } = await q;
            if (error) throw error;

            // Also fetch MFR-scoped events if user has mfr_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('mfr_id')
                .eq('id', user.id)
                .single();

            let mfrEvents: any[] = [];
            if (profile?.mfr_id) {
                const { data: mfrData, error: mfrErr } = await (supabase as any)
                    .from('team_events')
                    .select('*')
                    .eq('scope', 'MFR')
                    .eq('mfr_id', profile.mfr_id)
                    .gte('start_at', startOfMonth.toISOString())
                    .lte('start_at', endOfMonth.toISOString())
                    .order('start_at', { ascending: true });

                if (!mfrErr && mfrData) {
                    const existingIds = new Set((data || []).map((e: any) => e.id));
                    mfrEvents = mfrData.filter((e: any) => !existingIds.has(e.id));
                }
            }

            return [...(data || []), ...mfrEvents] as TeamEvent[];
        },
        enabled: !!teamId && !!user,
    });

    const createEvent = useMutation({
        mutationFn: async (input: CreateEventInput) => {
            const { data, error } = await (supabase as any)
                .from('team_events')
                .insert({
                    ...input,
                    created_by: user!.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-events'] });
            toast.success('Evento criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao criar evento');
        },
    });

    const updateEvent = useMutation({
        mutationFn: async (input: UpdateEventInput) => {
            const { id, ...updates } = input;
            const { data, error } = await (supabase as any)
                .from('team_events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-events'] });
            toast.success('Evento atualizado!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao atualizar evento');
        },
    });

    const deleteEvent = useMutation({
        mutationFn: async (eventId: string) => {
            const { error } = await (supabase as any)
                .from('team_events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-events'] });
            toast.success('Evento removido!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao remover evento');
        },
    });

    return {
        events: query.data || [],
        isLoading: query.isLoading,
        refetch: query.refetch,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
