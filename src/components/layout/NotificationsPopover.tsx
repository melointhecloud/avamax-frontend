import { Bell, CheckCheck, UserPlus, Loader2, Coins, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { supabase } from '@/integrations/supabase/client'
import { invokeEdgeFunction } from '@/lib/supabase-edge'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'

export const NotificationsPopover = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications()

  const [open, setOpen] = useState(false)
  const [processingInvite, setProcessingInvite] = useState<string | null>(null)

  // Invalidate user credits cache when there are new credit-related notifications
  useEffect(() => {
    const hasCreditNotification = notifications.some(
      n => (n.type === 'credits' || n.message?.toLowerCase().includes('crédito')) && !n.read
    )
    if (hasCreditNotification) {
      queryClient.invalidateQueries({ queryKey: ['user-credits'] })
    }
  }, [notifications, queryClient])

  const handleAcceptInvite = async (notification: Notification) => {
    const inviteId = notification.action_data?.invite_id
    if (!inviteId) {
      toast.error('Convite inválido')
      return
    }

    setProcessingInvite(notification.id)

    try {
      const { data, error } = await invokeEdgeFunction<{ teamName?: string }>('accept-team-invite', {
        body: { inviteId, sourcePath: window.location.pathname }
      })

      if (error) {
        // Se convite foi revogado/expirado/aceito, remover a notificação
        if (error.message?.includes('revogado') ||
          error.message?.includes('expirado') ||
          error.message?.includes('aceito') ||
          error.message?.includes('membro')) {
          deleteNotification.mutate(notification.id)
        }
        return
      }

      toast.success(`Você agora faz parte do time ${data?.teamName || notification.action_data?.team_name}!`)
      deleteNotification.mutate(notification.id)
      refetch()
    } catch (err: any) {
      console.error('Error accepting invite:', err)
    } finally {
      setProcessingInvite(null)
    }
  }

  const handleDeclineInvite = async (notification: Notification) => {
    const inviteId = notification.action_data?.invite_id
    if (!inviteId) {
      toast.error('Convite inválido')
      return
    }

    setProcessingInvite(notification.id)

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'REVOKED' })
        .eq('id', inviteId)

      if (error) throw error

      toast.success('Convite recusado')
      deleteNotification.mutate(notification.id)
      refetch()
    } catch (err: any) {
      console.error('Error declining invite:', err)
      toast.error(err.message || 'Erro ao recusar convite')
    } finally {
      setProcessingInvite(null)
    }
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR })
    } catch {
      return ''
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team_invite':
        return <UserPlus className="h-4 w-4 text-primary" />
      case 'credits':
        return <Coins className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
      case 'team_notice':
        return <Megaphone className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 p-4 transition-colors',
                    !notification.read && 'bg-primary/5',
                    notification.type !== 'team_invite' && 'cursor-pointer hover:bg-muted/50'
                  )}
                  onClick={() => {
                    if (notification.type !== 'team_invite' && !notification.read) {
                      markAsRead.mutate(notification.id)
                    }
                    if (notification.type === 'team_notice' && notification.action_data?.route) {
                      setOpen(false)
                      navigate(notification.action_data.route)
                    }
                  }}
                >
                  {getNotificationIcon(notification.type) && (
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm',
                        !notification.read && 'font-medium'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className={cn(
                      'text-xs text-muted-foreground',
                      notification.type === 'team_notice' ? 'whitespace-pre-wrap' : 'line-clamp-2'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(notification.created_at)}
                    </p>
                    {notification.type === 'team_notice' && (
                      <p className="text-xs font-medium text-primary mt-1">
                        Ver no Noticiário →
                      </p>
                    )}

                    {/* Team invite actions */}
                    {notification.type === 'team_invite' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcceptInvite(notification)
                          }}
                          disabled={processingInvite === notification.id}
                        >
                          {processingInvite === notification.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeclineInvite(notification)
                          }}
                          disabled={processingInvite === notification.id}
                        >
                          Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
