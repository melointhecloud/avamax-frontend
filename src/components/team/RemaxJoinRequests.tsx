import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, UserX, Building2, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface JoinRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  franchise_name: string | null;
}

interface RemaxJoinRequestsProps {
  teamId: string | null;
  onApproved?: () => void;
}

export function RemaxJoinRequests({ teamId, onApproved }: RemaxJoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    loadRequests();
  }, [teamId]);

  async function loadRequests() {
    if (!teamId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_remax_join_requests', {
        p_team_id: teamId,
      });

      if (error) throw error;

      setRequests((data as unknown as JoinRequest[]) || []);
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    setProcessingId(requestId);
    try {
      const { data, error } = await supabase.rpc('approve_remax_join_request', {
        p_request_id: requestId,
      });

      if (error) throw error;

      const result = data as any;
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Corretor aprovado e adicionado ao time!');
      loadRequests();
      onApproved?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar solicitação');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: string) {
    setProcessingId(requestId);
    try {
      const { data, error } = await supabase.rpc('reject_remax_join_request', {
        p_request_id: requestId,
      });

      if (error) throw error;

      toast.success('Solicitação recusada');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao recusar solicitação');
    } finally {
      setProcessingId(null);
    }
  }

  // Don't render if no team or no pending requests
  if (!teamId) return null;
  if (!loading && requests.length === 0) return null;

  return (
    <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-team-foreground text-base sm:text-lg">
          <Building2 className="h-5 w-5 text-[#CC0000] shrink-0" />
          Solicitações RE/MAX
          {requests.length > 0 && (
            <Badge className="bg-[#CC0000]/10 text-[#CC0000] border border-[#CC0000]/20 text-xs">
              {requests.length} pendente{requests.length > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-team-accent" />
          ))
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-team-border bg-gradient-to-br from-team-accent/30 to-team-accent/10 p-3 sm:p-4"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-[#CC0000]/20">
                  <AvatarFallback className="bg-[#CC0000]/10 text-[#CC0000] font-medium">
                    {request.user_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-team-foreground text-sm">
                    {request.user_name || 'Corretor'}
                  </p>
                  <p className="truncate text-xs text-team-muted">{request.user_email || ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-team-border text-team-muted">
                      {request.franchise_name || 'Franquia'}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-team-muted">
                      <Clock className="h-3 w-3" />
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Aprovar
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === request.id}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="remax-theme border-team-border bg-team-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-team-foreground">
                        Recusar {request.user_name || 'corretor'}?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-team-muted">
                        O corretor será notificado e poderá solicitar novamente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-team-border bg-team-accent text-team-foreground hover:bg-team-accent/80">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReject(request.id)}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Recusar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
