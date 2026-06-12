import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { useTeamLayoutData } from '@/hooks/useTeamLayoutData';
import { useTeamEvents, type TeamEvent } from '@/hooks/useTeamEvents';
import { useTeamNotices } from '@/hooks/useTeamNotices';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEventDialog } from '@/components/team/CreateEventDialog';
import { EventDetailDialog } from '@/components/team/EventDetailDialog';
import { CreateNoticeDialog } from '@/components/noticiario/CreateNoticeDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Megaphone, Bell } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function TeamCalendar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isMfrRoute = pathname.startsWith('/mfr/');
  const { data: teamData } = useTeamLayoutData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
  const [isMfr, setIsMfr] = useState(false);
  const [userMfrId, setUserMfrId] = useState<string | null>(null);

  const [mfrFranchiseTeamIds, setMfrFranchiseTeamIds] = useState<string[]>([]);

  // Check if user is MFR
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('mfr_id').eq('id', user.id).single().then(({ data }) => {
      if (data?.mfr_id) {
        setIsMfr(true);
        setUserMfrId(data.mfr_id);
      }
    });
  }, [user]);

  // Fetch all franchise team_ids for MFR
  useEffect(() => {
    if (!userMfrId) return;
    supabase
      .from('remax_franchises')
      .select('team_id')
      .eq('mfr_id', userMfrId)
      .eq('active', true)
      .not('team_id', 'is', null)
      .then(({ data }) => {
        const ids = (data || []).map(d => d.team_id).filter(Boolean) as string[];
        setMfrFranchiseTeamIds(ids);
      });
  }, [userMfrId]);

  const effectiveTeamId = teamData?.teamId || mfrFranchiseTeamIds[0] || null;

  const { events, createEvent, deleteEvent } = useTeamEvents(effectiveTeamId, currentMonth, teamData?.userRole === 'owner' || isMfr);
  const { data: notices } = useTeamNotices();

  const isOwner = teamData?.userRole === 'owner';

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: ptBR });
    const calEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => events.filter(e => isSameDay(new Date(e.start_at), day));

  // Check if a day falls within any event's duration (for multi-day fill)
  const getSpanningEvents = (day: Date) => {
    return events.filter(e => {
      const evStart = startOfDay(new Date(e.start_at));
      const evEnd = endOfDay(new Date(e.end_at));
      // Only mark if event spans multiple days AND this day is within range but NOT the start day
      if (isSameDay(evStart, evEnd)) return false;
      return isWithinInterval(day, { start: evStart, end: evEnd });
    });
  };

  const isSpanningDay = (day: Date) => {
    return getSpanningEvents(day).length > 0;
  };

  const isStartDay = (day: Date, event: TeamEvent) => isSameDay(new Date(event.start_at), day);

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id, { onSuccess: () => setSelectedEvent(null) });
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => new Date(e.start_at) >= now).slice(0, 5);
  }, [events]);

  const recentNotices = (notices || []).slice(0, 5);

  const calendarContent = (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-team-orange/20">
              <CalendarDays className="h-5 w-5 text-team-orange" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-team-foreground">Agenda do Time</h1>
              <p className="text-sm text-team-muted">Eventos e compromissos compartilhados</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Panel */}
          <div className="lg:col-span-1 space-y-4">
            {(isOwner || isMfr) && (
              <div className="space-y-2">
                <Button onClick={() => setNoticeOpen(true)} className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
                  <Megaphone className="h-4 w-4" /> Novo Aviso
                </Button>
                <Button onClick={() => setCreateOpen(true)} className="w-full bg-team-orange hover:bg-team-orange/90 text-white gap-2">
                  <Plus className="h-4 w-4" /> Novo Evento
                </Button>
              </div>
            )}

            {/* Upcoming events */}
            <div className="rounded-xl border border-team-border bg-team-card p-4">
              <h3 className="text-sm font-semibold text-team-foreground mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-team-orange" />
                Próximos Eventos
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-team-muted">Nenhum evento programado.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full text-left rounded-lg border border-team-border/50 p-2.5 hover:bg-team-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                        <span className="text-xs font-medium text-team-foreground truncate">{ev.title}</span>
                      </div>
                      <p className="text-[10px] text-team-muted ml-4">
                        {format(new Date(ev.start_at), "dd MMM · HH:mm", { locale: ptBR })}
                        {' → '}
                        {format(new Date(ev.end_at), "dd MMM · HH:mm", { locale: ptBR })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent notices */}
            <div className="rounded-xl border border-team-border bg-team-card p-4">
              <h3 className="text-sm font-semibold text-team-foreground mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                Avisos Recentes
              </h3>
              {recentNotices.length === 0 ? (
                <p className="text-xs text-team-muted">Nenhum aviso recente.</p>
              ) : (
                <div className="space-y-2">
                  {recentNotices.map(notice => (
                    <div key={notice.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                      <p className="text-xs font-medium text-team-foreground">{notice.title}</p>
                      {notice.description && (
                        <p className="text-[10px] text-team-muted mt-0.5 line-clamp-2">{notice.description}</p>
                      )}
                      <p className="text-[10px] text-team-muted mt-1">
                        por {notice.creator_name} · {format(new Date(notice.created_at), "dd MMM", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3 rounded-xl border border-team-border bg-team-card p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="text-team-muted hover:text-team-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-team-foreground capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="text-team-muted hover:text-team-foreground">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-medium text-team-muted py-2">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                const spanning = isSpanningDay(day);
                const spanningEventsForDay = getSpanningEvents(day);
                // Show spanning event indicators (non-start days)
                const nonStartSpanning = spanningEventsForDay.filter(e => !isStartDay(day, e));

                return (
                  <div
                    key={i}
                    className={cn(
                      'relative min-h-[70px] border border-team-border/30 p-1 text-xs transition-colors',
                      !inMonth && 'opacity-30',
                      isToday(day) && 'bg-team-orange/10',
                      spanning && !isToday(day) && 'bg-red-500/10'
                    )}
                  >
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      isToday(day) ? 'bg-team-orange text-white font-bold' : 'text-team-foreground'
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white leading-tight hover:opacity-80"
                          style={{ backgroundColor: ev.color || '#3b82f6' }}
                        >
                          {ev.title}
                        </button>
                      ))}
                      {/* Show thin continuation bars for spanning events on non-start days */}
                      {nonStartSpanning.slice(0, 2).map(ev => (
                        <button
                          key={`span-${ev.id}`}
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight hover:opacity-80 opacity-60"
                          style={{ backgroundColor: ev.color || '#3b82f6', color: 'white' }}
                        >
                          ↳ {ev.title}
                        </button>
                      ))}
                      {(dayEvents.length + nonStartSpanning.length) > 2 && dayEvents.length <= 2 && nonStartSpanning.length <= 2 ? null :
                        dayEvents.length > 2 && (
                          <span className="text-[10px] text-team-muted pl-1">+{dayEvents.length - 2}</span>
                        )
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {effectiveTeamId && (
          <>
            <CreateEventDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              onSubmit={(input) => createEvent.mutate(input)}
              isPending={createEvent.isPending}
              teamId={effectiveTeamId}
              members={teamData?.members || []}
              allTeamIds={mfrFranchiseTeamIds.length > 1 ? mfrFranchiseTeamIds : undefined}
            />
            <CreateNoticeDialog
              open={noticeOpen}
              onOpenChange={setNoticeOpen}
              teamId={effectiveTeamId}
              members={teamData?.members || []}
              allTeamIds={mfrFranchiseTeamIds.length > 1 ? mfrFranchiseTeamIds : undefined}
            />
          </>
        )}

        <EventDetailDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}
          onDelete={handleDelete}
          isDeleting={deleteEvent.isPending}
          canManage={isOwner || isMfr || selectedEvent?.created_by === user?.id}
          members={teamData?.members || []}
        />
      </div>
  );

  if (isMfrRoute) return calendarContent;

  return (
    <TeamDashboardLayout title="Agenda" subtitle="Eventos e compromissos do time">
      {calendarContent}
    </TeamDashboardLayout>
  );
}
