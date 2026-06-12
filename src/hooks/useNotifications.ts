import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface NotificationActionData {
  invite_id?: string;
  team_id?: string;
  team_name?: string;
  route?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'team_invite' | 'credits' | 'team_notice';
  read: boolean;
  action_data: NotificationActionData | null;
  created_at: string | null;
}

// Helper function to safely parse action_data
function parseActionData(data: Json | null): NotificationActionData | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as NotificationActionData;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to ensure proper typing
      return (data || []).map(item => ({
        ...item,
        type: item.type as Notification['type'],
        action_data: parseActionData(item.action_data)
      })) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Polling every 30s
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    unreadCount: (query.data ?? []).filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: query.refetch,
  };
}
