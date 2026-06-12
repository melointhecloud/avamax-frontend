import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  Building2,
  Clock3,
  User,
} from 'lucide-react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  endOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCeoAgenda } from '@/hooks/useCeoAgenda';
import { type TeamEvent } from '@/hooks/useTeamEvents';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function scopeLabel(scope: TeamEvent['scope']) {
  if (scope === 'GLOBAL') return 'Global';
  if (scope === 'MFR') return 'MFR';
  if (scope === 'ASSIGNED') return 'Atribuído';
  return 'Individual';
}

function ScopeIcon({ scope }: { scope: TeamEvent['scope'] }) {
  if (scope === 'MFR') return <Building2 className="h-3 w-3" />;
  return <Globe className="h-3 w-3" />;
}

export default function CeoAgenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
  const { data, isLoading } = useCeoAgenda(currentMonth);

  const events = data?.events || [];
  const notices = data?.notices || [];

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.start_at) >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 5);
  }, [events]);

  const globalCount = events.filter((event) => event.scope === 'GLOBAL').length;
  const mfrCount = events.filter((event) => event.scope === 'MFR').length;

  const getEventsForDay = (day: Date) => events.filter((event) => isSameDay(new Date(event.start_at), day));

  const getSpanningEvents = (day: Date) =>
    events.filter((event) => {
      const eventStart = startOfDay(new Date(event.start_at));
      const eventEnd = endOfDay(new Date(event.end_at));
      if (isSameDay(eventStart, eventEnd)) return false;
      return isWithinInterval(day, { start: eventStart, end: eventEnd });
    });

  const previousMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-4">
          <Skeleton className="h-80 rounded-2xl lg:col-span-1" />
          <Skeleton className="h-[520px] rounded-2xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="neu-card overflow-hidden rounded-3xl border border-border">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agenda CEO</h1>
              <p className="text-sm text-muted-foreground">
                Visão híbrida da rede com eventos globais e compromissos MFR no contexto RE/MAX.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1 rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-3 w-3" />
              {events.length} eventos
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full bg-accent/10 text-accent">
              <Globe className="h-3 w-3" />
              {globalCount} globais
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full bg-secondary text-secondary-foreground">
              <Building2 className="h-3 w-3" />
              {mfrCount} MFR
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="space-y-4 lg:col-span-1">
          <section className="neu-card rounded-2xl border border-border p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próximos eventos
            </h2>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum evento futuro neste período.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:bg-secondary"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                      <span className="truncate text-sm font-medium text-foreground">{event.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(event.start_at), "dd MMM · HH:mm", { locale: ptBR })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="neu-card rounded-2xl border border-border p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="h-4 w-4 text-primary" />
              Avisos recentes
            </h2>

            {notices.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum aviso recente nesta agenda híbrida.</p>
            ) : (
              <div className="space-y-2">
                {notices.map((notice) => (
                  <div key={notice.id} className="rounded-xl border border-border bg-secondary/60 p-3">
                    <p className="text-sm font-medium text-foreground">{notice.title}</p>
                    {notice.description ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{notice.description}</p>
                    ) : null}
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {notice.creator_name || 'Sistema RE/MAX'} · {format(new Date(notice.created_at), 'dd MMM', { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        <section className="neu-card rounded-2xl border border-border p-4 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold capitalize text-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-border/70">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const spanningEvents = getSpanningEvents(day).filter((event) => !isSameDay(new Date(event.start_at), day));
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={`${day.toISOString()}-${index}`}
                  className={cn(
                    'min-h-[92px] border-b border-r border-border/70 p-2 align-top',
                    !isCurrentMonth && 'bg-secondary/30 text-muted-foreground',
                    isToday(day) && 'bg-primary/5',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                      isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="mt-1.5 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium text-white transition hover:opacity-90"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.title}
                      </button>
                    ))}

                    {spanningEvents.slice(0, 1).map((event) => (
                      <button
                        key={`span-${event.id}`}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="w-full truncate rounded-md border border-primary/20 bg-primary/10 px-1.5 py-1 text-left text-[10px] font-medium text-primary transition hover:bg-primary/15"
                      >
                        ↳ {event.title}
                      </button>
                    ))}

                    {dayEvents.length > 2 ? (
                      <span className="block px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 2} itens</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-lg">
          {selectedEvent ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                  <DialogTitle className="text-lg text-foreground">{selectedEvent.title}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {selectedEvent.description ? (
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1 rounded-full bg-primary/10 text-primary">
                    <ScopeIcon scope={selectedEvent.scope} />
                    {scopeLabel(selectedEvent.scope)}
                  </Badge>
                </div>

                <div className="space-y-2 rounded-2xl bg-secondary/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>
                      {format(new Date(selectedEvent.start_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>
                      {format(new Date(selectedEvent.start_at), 'HH:mm')} — {format(new Date(selectedEvent.end_at), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.creator_name || 'Sistema RE/MAX'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
