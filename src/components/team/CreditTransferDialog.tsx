import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Minus, Plus, Coins, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreditTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    user_id: string;
    nome: string | null;
    email: string | null;
    avatar_url: string | null;
    allocated_credits?: number;
  } | null;
  teamId: string;
  availablePool: number;
  onSuccess: () => void;
}

export function CreditTransferDialog({
  open,
  onOpenChange,
  member,
  teamId,
  availablePool,
  onSuccess,
}: CreditTransferDialogProps) {
  const [amount, setAmount] = useState(1);
  const [sending, setSending] = useState(false);

  const maxAmount = Math.min(availablePool, 100); // Cap at 100 per transfer

  const increment = () => {
    setAmount((prev) => Math.min(prev + 1, maxAmount));
  };

  const decrement = () => {
    setAmount((prev) => Math.max(prev - 1, 1));
  };

  const handleTransfer = async () => {
    if (!member || !teamId || amount <= 0) return;

    setSending(true);
    try {
      const { data, error } = await supabase.rpc('transfer_team_credits', {
        p_team_id: teamId,
        p_to_user_id: member.user_id,
        p_amount: amount,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; transferred?: number };

      if (!result.success) {
        toast.error(result.error || 'Erro ao transferir créditos');
        return;
      }

      toast.success(`${amount} créditos enviados para ${member.nome || 'membro'}!`);
      onSuccess();
      onOpenChange(false);
      setAmount(1);
    } catch (error: any) {
      console.error('Error transferring credits:', error);
      toast.error(error.message || 'Erro ao transferir créditos');
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAmount(1);
    }
    onOpenChange(newOpen);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="remax-theme sm:max-w-md border-team-border bg-team-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-team-foreground">
            <Coins className="h-5 w-5 text-team-orange" />
            Enviar Créditos
          </DialogTitle>
          <DialogDescription className="text-team-muted">
            Distribua créditos do pool do time para este membro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Member Info */}
          <div className="flex items-center gap-3 rounded-lg border border-team-border bg-team-accent/20 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback className="bg-team-primary text-team-primary-foreground">
                {member.nome?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-team-foreground truncate">
                {member.nome || 'Usuário'}
              </p>
              <p className="text-xs text-team-muted truncate">{member?.email || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-team-muted">Atual</p>
              <p className="font-medium text-team-foreground">
                {member.allocated_credits || 0}
              </p>
            </div>
          </div>

          {/* Amount Selector */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-team-muted">Quantidade de créditos</p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decrement}
                disabled={amount <= 1}
                className="h-12 w-12 rounded-full border-team-border bg-team-accent/30 text-team-foreground hover:bg-team-accent disabled:opacity-50"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="flex h-16 w-20 items-center justify-center rounded-xl border border-team-border bg-team-accent/20">
                <span className="text-3xl font-bold text-team-orange">{amount}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={increment}
                disabled={amount >= maxAmount}
                className="h-12 w-12 rounded-full border-team-border bg-team-accent/30 text-team-foreground hover:bg-team-accent disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-team-muted">
              Pool disponível: <span className="font-medium text-team-foreground">{availablePool}</span> créditos
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-team-border bg-transparent text-team-foreground hover:bg-team-accent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={sending || amount <= 0 || amount > availablePool}
            className="bg-team-orange text-white hover:bg-team-orange/90"
          >
            {sending ? (
              'Enviando...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar {amount} crédito{amount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
