import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface Transfer {
  id: string;
  amount: number;
  created_at: string;
  to_user_id: string;
  to_user_name: string | null;
  to_user_avatar: string | null;
}

interface CreditTransferHistoryProps {
  teamId: string | null;
  refreshKey?: number;
}

export function CreditTransferHistory({ teamId, refreshKey }: CreditTransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    async function loadTransfers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_credit_transfers')
          .select(`
            id,
            amount,
            created_at,
            to_user_id,
            profiles!team_credit_transfers_to_user_id_fkey(nome, avatar_url)
          `)
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formatted = (data || []).map((t: any) => ({
          id: t.id,
          amount: t.amount,
          created_at: t.created_at,
          to_user_id: t.to_user_id,
          to_user_name: t.profiles?.nome || null,
          to_user_avatar: t.profiles?.avatar_url || null,
        }));

        setTransfers(formatted);
      } catch (error) {
        console.error('Error loading transfers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, [teamId, refreshKey]);

  if (!teamId) return null;

  return (
    <Card className="border-team-border bg-team-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-team-foreground text-base sm:text-lg">
          <History className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          Histórico de Transferências
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 bg-team-accent" />
            ))}
          </div>
        ) : transfers.length === 0 ? (
          <p className="text-center text-sm text-team-muted py-4">
            Nenhuma transferência realizada
          </p>
        ) : (
          <div className="space-y-2">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center gap-3 rounded-lg border border-team-border bg-team-accent/20 p-3"
              >
                {/* Amount */}
                <div className="flex items-center justify-center rounded-lg bg-team-orange/10 px-2 py-1 shrink-0">
                  <span className="text-sm font-bold text-team-orange">
                    +{transfer.amount}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-team-muted shrink-0" />

                {/* Recipient */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={transfer.to_user_avatar || undefined} />
                    <AvatarFallback className="bg-team-primary text-team-primary-foreground text-xs">
                      {transfer.to_user_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-team-foreground truncate">
                    {transfer.to_user_name || 'Usuário'}
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs text-team-muted shrink-0">
                  {format(new Date(transfer.created_at), "dd MMM", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
