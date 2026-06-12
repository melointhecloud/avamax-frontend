import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Users } from 'lucide-react';

interface MemberInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  currentGoal?: number;
}

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentGoal?: number;
  onSave: (goal: number) => void;
  onSaveIndividual?: (goals: { userId: string; goal: number }[]) => void;
  isLoading?: boolean;
  isBulk?: boolean;
  members?: MemberInfo[];
}

export function SetGoalDialog({
  open,
  onOpenChange,
  memberName,
  currentGoal,
  onSave,
  onSaveIndividual,
  isLoading,
  isBulk = false,
  members = [],
}: SetGoalDialogProps) {
  const [goal, setGoal] = useState<string>(currentGoal?.toString() || '');
  const [individualMode, setIndividualMode] = useState(false);
  const [individualGoals, setIndividualGoals] = useState<Record<string, string>>({});

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setGoal(currentGoal?.toString() || '');
      setIndividualMode(false);
      // Initialize individual goals with current values
      const initial: Record<string, string> = {};
      members.forEach(m => {
        initial[m.id] = m.currentGoal?.toString() || '';
      });
      setIndividualGoals(initial);
    }
  }, [open, currentGoal, members]);

  const handleSave = () => {
    if (individualMode && onSaveIndividual) {
      const goals = Object.entries(individualGoals)
        .filter(([_, value]) => value && parseInt(value, 10) > 0)
        .map(([userId, value]) => ({ userId, goal: parseInt(value, 10) }));
      if (goals.length > 0) {
        onSaveIndividual(goals);
      }
    } else {
      const goalValue = parseInt(goal, 10);
      if (goalValue > 0) {
        onSave(goalValue);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setGoal(currentGoal?.toString() || '');
      setIndividualMode(false);
    }
    onOpenChange(newOpen);
  };

  const updateIndividualGoal = (memberId: string, value: string) => {
    setIndividualGoals(prev => ({ ...prev, [memberId]: value }));
  };

  const isValid = individualMode
    ? Object.values(individualGoals).some(v => v && parseInt(v, 10) > 0)
    : goal && parseInt(goal, 10) > 0;

  const showIndividualOption = isBulk && members.length > 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="remax-theme border-team-border bg-team-card sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-team-foreground">
            {isBulk ? (
              <Users className="h-5 w-5 text-team-orange" />
            ) : (
              <Target className="h-5 w-5 text-team-orange" />
            )}
            Definir Meta Mensal
          </DialogTitle>
          <DialogDescription className="text-team-muted">
            {isBulk ? (
              <>Defina a meta de avaliações para <strong className="text-team-foreground">{members.length} membros</strong> neste mês.</>
            ) : (
              <>Defina a meta de avaliações para <strong className="text-team-foreground">{memberName}</strong> neste mês.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mode toggle for bulk selection */}
          {showIndividualOption && (
            <div className="flex gap-2 rounded-lg bg-team-accent/50 p-1">
              <button
                type="button"
                onClick={() => setIndividualMode(false)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  !individualMode 
                    ? 'bg-team-orange text-white' 
                    : 'text-team-muted hover:text-team-foreground'
                }`}
              >
                Meta única
              </button>
              <button
                type="button"
                onClick={() => setIndividualMode(true)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  individualMode 
                    ? 'bg-team-orange text-white' 
                    : 'text-team-muted hover:text-team-foreground'
                }`}
              >
                Metas individuais
              </button>
            </div>
          )}

          {/* Bulk goal input */}
          {!individualMode && (
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-team-foreground">
                Meta de avaliações
              </Label>
              <Input
                id="goal"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted"
              />
              <p className="text-xs text-team-muted">
                {isBulk
                  ? 'Esta meta será aplicada para todos os membros selecionados.'
                  : 'O membro verá seu progresso em relação a esta meta no cabeçalho do sistema.'}
              </p>
            </div>
          )}

          {/* Individual goals input */}
          {individualMode && (
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 rounded-lg border border-team-border bg-team-accent/20 p-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback className="bg-team-orange/20 text-team-orange text-xs">
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm text-team-foreground truncate min-w-0">
                      {member.name}
                    </span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Meta"
                      value={individualGoals[member.id] || ''}
                      onChange={(e) => updateIndividualGoal(member.id, e.target.value)}
                      className="w-20 border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted text-center"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-team-border bg-team-accent text-team-foreground hover:bg-team-accent/80"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className="bg-team-orange text-white hover:bg-team-orange/90"
          >
            {isLoading ? 'Salvando...' : 'Salvar Meta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}