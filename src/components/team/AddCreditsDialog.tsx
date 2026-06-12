import { useState } from 'react';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddCreditsDialogProps {
  memberName: string;
  memberId: string;
  teamId: string;
  currentCredits: number;
  availablePool: number;
  onSuccess: () => void;
}

export function AddCreditsDialog({
  memberName,
  memberId,
  teamId,
  currentCredits,
  availablePool,
  onSuccess,
}: AddCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const numAmount = parseInt(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= availablePool;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (availablePool <= 0) {
      toast.error('Não há créditos disponíveis no pool do time');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.rpc('add_member_credits', {
        p_team_id: teamId,
        p_user_id: memberId,
        p_amount: numAmount,
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; new_balance?: number };
      if (!result.success) {
        throw new Error(result.message || 'Erro ao adicionar créditos');
      }

      toast.success(`${numAmount} crédito${numAmount > 1 ? 's' : ''} enviado${numAmount > 1 ? 's' : ''} para ${memberName}`);
      setAmount('');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar créditos');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-full bg-team-orange/10 text-team-orange hover:bg-team-orange/20 hover:text-team-orange"
          title="Adicionar créditos"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="remax-theme border-team-border bg-team-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-team-foreground">
            <Wallet className="h-5 w-5 text-team-orange" />
            Adicionar Créditos
          </DialogTitle>
          <DialogDescription className="text-team-muted">
            Envie créditos do pool do time para <span className="font-medium text-team-foreground">{memberName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current status */}
          <div className="flex items-center justify-between rounded-lg border border-team-border bg-team-accent/30 p-3">
            <div>
              <p className="text-xs text-team-muted">Créditos atuais</p>
              <p className="text-lg font-bold text-team-foreground">{currentCredits}</p>
            </div>
            <div className="h-8 w-px bg-team-border" />
            <div>
              <p className="text-xs text-team-muted">Pool disponível</p>
              <p className="text-lg font-bold text-team-orange">{availablePool}</p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-team-foreground">
              Quantidade a enviar
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={availablePool}
              placeholder="Ex: 5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted"
            />
            {numAmount > availablePool && (
              <p className="text-xs text-red-400">
                Você só tem {availablePool} crédito{availablePool !== 1 ? 's' : ''} disponível{availablePool !== 1 ? 'eis' : ''} no pool
              </p>
            )}
          </div>

          {/* Preview */}
          {numAmount > 0 && numAmount <= availablePool && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <p className="text-sm text-green-400">
                Após enviar: <span className="font-bold">{memberName}</span> terá{' '}
                <span className="font-bold">{currentCredits + numAmount}</span> créditos
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-team-border bg-team-accent text-team-foreground hover:bg-team-accent/80"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || sending}
            className="bg-team-orange text-white hover:bg-team-orange/90"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Enviar {numAmount > 0 ? numAmount : ''} Crédito{numAmount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
