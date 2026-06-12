import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberGoalProgressProps {
  goal: number;
  current: number;
  progress: number;
  canEdit?: boolean;
  onEdit?: () => void;
  compact?: boolean;
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export function MemberGoalProgress({
  goal,
  current,
  progress,
  canEdit,
  onEdit,
  compact = false,
}: MemberGoalProgressProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-team-muted" />
        <span className="text-xs text-team-muted">
          {goal > 0 ? `${current}/${goal}` : 'Sem meta'}
        </span>
        {goal > 0 && progress >= 100 && (
          <Check className="h-3.5 w-3.5 text-green-500" />
        )}
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-team-muted hover:text-team-orange hover:bg-team-orange/10"
            onClick={onEdit}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className="h-4 w-4 text-team-orange" />
          <span className="text-xs text-team-muted">Meta mensal</span>
        </div>
        <div className="flex items-center gap-1.5">
          {goal > 0 && progress >= 100 && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm font-medium text-team-foreground">
            {goal > 0 ? `${current}/${goal}` : 'Não definida'}
          </span>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-team-muted hover:text-team-orange hover:bg-team-orange/10"
              onClick={onEdit}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {goal > 0 && (
        <Progress
          value={progress}
          className={cn(
            'h-2 bg-team-accent',
            `[&>div]:${getProgressColor(progress)}`
          )}
        />
      )}
    </div>
  );
}
