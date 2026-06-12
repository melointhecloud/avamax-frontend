import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TeamEvent } from '@/hooks/useTeamEvents';
import type { TeamMember } from '@/hooks/useTeamLayoutData';

interface EventDetailDialogProps {
  event: TeamEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  canManage: boolean;
  members: TeamMember[];
}

export function EventDetailDialog({ event, open, onOpenChange, onDelete, isDeleting, canManage, members }: EventDetailDialogProps) {
  if (!event) return null;

  const assignee = members.find(m => m.user_id === event.assigned_to);
  const creator = members.find(m => m.user_id === event.created_by);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="remax-theme sm:max-w-md bg-team-sidebar border-team-border text-team-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color || '#3b82f6' }} />
            <DialogTitle className="text-lg">{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {event.description && (
            <p className="text-sm text-team-muted">{event.description}</p>
          )}

          {(() => {
            const start = new Date(event.start_at);
            const end = new Date(event.end_at);
            const sameDay = start.toDateString() === end.toDateString();
            return (
              <>
                <div className="flex items-center gap-2 text-sm text-team-muted">
                  <CalendarDays className="h-4 w-4" />
                  {sameDay ? (
                    <span>{format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  ) : (
                    <span>
                      {format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} → {format(end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-team-muted">
                  <Clock className="h-4 w-4" />
                  <span>{format(start, 'HH:mm')} — {format(end, 'HH:mm')}</span>
                </div>
              </>
            );
          })()}

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={
              event.scope === 'GLOBAL' ? 'bg-team-orange/20 text-team-orange' :
              event.scope === 'MFR' ? 'bg-purple-500/20 text-purple-400' :
              event.scope === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
              'bg-team-primary/20 text-team-primary'
            }>
              {event.scope === 'GLOBAL' ? 'Global' : event.scope === 'MFR' ? 'MFR' : event.scope === 'ASSIGNED' ? 'Atribuído' : 'Individual'}
            </Badge>
          </div>

          {assignee && (
            <div className="flex items-center gap-2 text-sm text-team-muted">
              <User className="h-4 w-4" />
              <span>Atribuído a: <strong className="text-team-foreground">{assignee.name || assignee.email}</strong></span>
            </div>
          )}

          {creator && (
            <p className="text-xs text-team-muted">
              Criado por {creator.name || creator.email}
            </p>
          )}

          {canManage && (
            <div className="flex justify-end pt-2">
              <Button variant="destructive" size="sm" disabled={isDeleting} onClick={() => onDelete(event.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Removendo...' : 'Remover'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
