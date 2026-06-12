import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Target, Edit2, Check, TrendingUp } from 'lucide-react';
import { useTeamGoals } from '@/hooks/useTeamGoals';
import { SetGoalDialog } from './SetGoalDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TeamGoalsCardProps {
  teamId: string | null;
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export function TeamGoalsCard({ teamId }: TeamGoalsCardProps) {
  const { data, isLoading, upsertGoal, isUpdating } = useTeamGoals(teamId);
  const [editingMember, setEditingMember] = useState<{
    userId: string;
    name: string;
    currentGoal: number;
  } | null>(null);

  if (isLoading) {
    return (
      <Card className="border-team-border bg-team-card">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40 bg-team-accent" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-team-accent" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const monthLabel = new Date(data.month + 'T00:00:00').toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const handleSaveGoal = (goal: number) => {
    if (editingMember) {
      upsertGoal(
        { userId: editingMember.userId, goal },
        { onSuccess: () => setEditingMember(null) }
      );
    }
  };

  return (
    <>
      <Card className="border-team-border bg-team-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-team-foreground">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-team-orange" />
              Metas do Time
            </div>
            <span className="text-xs font-normal text-team-muted capitalize">
              {monthLabel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.members.length === 0 ? (
            <p className="text-center text-sm text-team-muted py-4">
              Nenhum membro no time
            </p>
          ) : (
            data.members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-lg border border-team-border bg-team-accent/20 p-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback className="bg-team-primary text-team-primary-foreground text-xs">
                    {member.nome?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-team-foreground">
                      {member.nome || 'Usuário'}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {member.progress >= 100 && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-xs text-team-muted">
                        {member.current}/{member.goal || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress
                      value={member.goal > 0 ? member.progress : 0}
                      className={cn(
                        'h-2 flex-1 bg-team-accent',
                        member.goal > 0 && `[&>div]:${getProgressColor(member.progress)}`
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-team-muted hover:text-team-orange hover:bg-team-orange/10"
                      onClick={() =>
                        setEditingMember({
                          userId: member.user_id,
                          name: member.nome || 'Membro',
                          currentGoal: member.goal || 0,
                        })
                      }
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {member.goal === 0 && (
                    <p className="mt-1 text-[10px] text-team-muted">
                      Meta não definida
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Summary */}
          {data.members.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-team-orange/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-team-orange" />
                <span className="text-xs text-team-muted">Total do time</span>
              </div>
              <span className="text-sm font-semibold text-team-foreground">
                {data.members.reduce((acc, m) => acc + m.current, 0)} avaliações
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <SetGoalDialog
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        memberName={editingMember?.name || ''}
        currentGoal={editingMember?.currentGoal}
        onSave={handleSaveGoal}
        isLoading={isUpdating}
      />
    </>
  );
}
