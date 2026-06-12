import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamLayoutData } from '@/hooks/useTeamLayoutData';
import { useTeamEvents, type TeamEvent } from '@/hooks/useTeamEvents';
import { useTeamNotices } from '@/hooks/useTeamNotices';
import { CreateEventDialog } from '@/components/team/CreateEventDialog';
import { EventDetailDialog } from '@/components/team/EventDetailDialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Bell, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useTenantPrefix } from '@/hooks/useTenantPrefix';

export function HomeAgendaSection() {
  const { user } = useAuth();
  const { data: teamData } = useTeamLayoutData();
  const navigate = useNavigate();
  const p = useTenantPrefix();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);

  const { events, createEvent, deleteEvent } = useTeamEvents(teamData?.teamId || null, new Date());

  const { data: notices } = useTeamNotices();

  const isOwner = teamData?.userRole === 'owner';

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => new Date(e.start_at) >= now).slice(0, 4);
  }, [events]);

  const recentNotices = (notices || []).slice(0, 3);

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id, { onSuccess: () => setSelectedEvent(null) });
  };

  // Don't render if user has no team
  if (!teamData?.teamId) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Agenda</h3>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateOpen(true)}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Evento
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(p('/time/agenda'))}
            className="h-7 gap-1 text-xs text-muted-foreground"
          >
            Ver tudo
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Próximos Eventos
          </h4>
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Nenhum evento programado</p>
          ) : (
            <div className="space-y-1.5">
              {upcomingEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left rounded-lg border border-border/50 p-2.5 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                    <span className="text-xs font-medium text-foreground truncate">{ev.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-4">
                    {format(new Date(ev.start_at), "dd MMM · HH:mm", { locale: ptBR })}
                    {' → '}
                    {format(new Date(ev.end_at), "dd MMM · HH:mm", { locale: ptBR })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Avisos Recentes
          </h4>
          {recentNotices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Nenhum aviso recente</p>
          ) : (
            <div className="space-y-1.5">
              {recentNotices.map(notice => (
                <div key={notice.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                  <p className="text-xs font-medium text-foreground">{notice.title}</p>
                  {notice.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{notice.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {notice.creator_name} · {format(new Date(notice.created_at), "dd MMM", { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {teamData?.teamId && (
        <CreateEventDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={(input) => createEvent.mutate(input)}
          isPending={createEvent.isPending}
          teamId={teamData.teamId}
          members={teamData.members || []}
        />
      )}

      <EventDetailDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}
        onDelete={handleDelete}
        isDeleting={deleteEvent.isPending}
        canManage={isOwner || selectedEvent?.created_by === user?.id}
        members={teamData?.members || []}
      />
    </div>
  );
}
