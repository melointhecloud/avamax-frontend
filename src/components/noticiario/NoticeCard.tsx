import { useState } from 'react';
import { Megaphone, Calendar, User, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { TeamNotice } from '@/hooks/useTeamNotices';
import { useDeleteNotice } from '@/hooks/useTeamNotices';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface NoticeCardProps {
  notice: TeamNotice;
  isOwner?: boolean;
}

export const NoticeCard = ({ notice, isOwner }: NoticeCardProps) => {
  const [showImage, setShowImage] = useState(false);
  const formattedDate = format(new Date(notice.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  const deleteNotice = useDeleteNotice();

  // Check if there's a scheduled date different from created_at
  const hasSchedule = notice.start_at && notice.start_at !== notice.created_at;
  const scheduledDate = hasSchedule
    ? format(new Date(notice.start_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;
  const scheduledEndDate = hasSchedule && notice.end_at && notice.end_at !== notice.start_at
    ? format(new Date(notice.end_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja apagar este aviso?')) return;
    try {
      await deleteNotice.mutateAsync(notice.id);
      toast.success('Aviso apagado com sucesso');
    } catch {
      toast.error('Erro ao apagar aviso');
    }
  };

  return (
    <>
    <Card className="overflow-hidden border-primary/20 bg-white/90 dark:bg-white/5">
      {notice.image_url && (
        <img
          src={notice.image_url}
          alt={notice.title}
          className="h-40 w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
          onClick={() => setShowImage(true)}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <Badge className="border-primary/30 bg-primary/15 text-primary hover:bg-primary/25">
                Aviso Interno
              </Badge>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleteNotice.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground sm:text-lg">
              {notice.title}
            </h3>
            {notice.description && (
              <p className="mb-2 text-sm text-muted-foreground">
                {notice.description}
              </p>
            )}

            {/* Scheduled date */}
            {scheduledDate && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {scheduledDate}
                  {scheduledEndDate && ` — ${scheduledEndDate}`}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {notice.creator_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {notice.image_url && (
      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <img
            src={notice.image_url}
            alt={notice.title}
            className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};
