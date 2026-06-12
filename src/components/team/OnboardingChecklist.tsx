import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Circle, Settings, Users, FileText, CreditCard, Sparkles, X } from 'lucide-react';
import { useTeamOnboarding } from '@/hooks/useTeamOnboarding';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

interface ChecklistItemProps {
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  actionLabel?: string;
}

function ChecklistItem({ title, description, completed, icon: Icon, action, actionLabel }: ChecklistItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border p-3 transition-all",
      completed 
        ? "border-green-500/30 bg-green-500/5" 
        : "border-team-border bg-team-accent/30 hover:bg-team-accent/50"
    ) as string}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        completed ? "bg-green-500 text-white" : "bg-team-muted/20 text-team-muted"
      }`}>
        {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          completed ? "text-green-500 line-through" : "text-team-foreground"
        )}>
          {title}
        </p>
        <p className="text-xs text-team-muted mt-0.5">{description}</p>
      </div>
      {!completed && action && (
        <Button 
          size="sm" 
          variant="ghost"
          onClick={action}
          className="shrink-0 text-xs h-7 px-2 text-team-orange hover:text-team-orange hover:bg-team-orange/10"
        >
          {actionLabel || 'Fazer'}
        </Button>
      )}
    </div>
  );
}

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const { status, isLoading, markStepComplete, progressPercentage, isComplete, showChecklist } = useTeamOnboarding();
  const [dismissed, setDismissed] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  // Trigger confetti when all steps complete
  useEffect(() => {
    if (isComplete && !hasShownConfetti) {
      setHasShownConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete, hasShownConfetti]);

  if (isLoading || !showChecklist || dismissed) {
    return null;
  }

  const steps = [
    {
      key: 'profile_configured',
      title: 'Configurar perfil do time',
      description: 'Defina o nome e personalize seu time',
      completed: status?.profile_configured ?? false,
      icon: Settings,
      action: () => navigate('/time/settings'),
      actionLabel: 'Configurar',
    },
    {
      key: 'first_member_invited',
      title: 'Convidar primeiro membro',
      description: 'Adicione corretores ao seu time',
      completed: status?.first_member_invited ?? false,
      icon: Users,
      action: () => navigate('/time/members'),
      actionLabel: 'Convidar',
    },
    {
      key: 'first_evaluation_done',
      title: 'Fazer primeira avaliação',
      description: 'Realize sua primeira avaliação de imóvel',
      completed: status?.first_evaluation_done ?? false,
      icon: FileText,
      action: () => navigate('/avaliar'),
      actionLabel: 'Avaliar',
    },
    {
      key: 'credits_viewed',
      title: 'Conhecer painel de créditos',
      description: 'Veja como gerenciar os créditos do time',
      completed: status?.credits_viewed ?? false,
      icon: CreditCard,
      action: () => {
        markStepComplete('credits_viewed');
        navigate('/time/credits');
      },
      actionLabel: 'Ver',
    },
  ];

  return (
    <Card className="border-team-border bg-gradient-to-br from-team-card to-team-accent/30 mb-6 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-team-orange/20">
              <Sparkles className="h-4 w-4 text-team-orange" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-team-foreground">
                Primeiros passos
              </CardTitle>
              <p className="text-xs text-team-muted mt-0.5">
                Complete para desbloquear todo o potencial do seu time
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 text-team-muted hover:text-team-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progressPercentage} className="h-2 flex-1" />
          <span className="text-xs font-medium text-team-orange">{progressPercentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {steps.map((step) => (
            <ChecklistItem
              key={step.key}
              title={step.title}
              description={step.description}
              completed={step.completed}
              icon={step.icon}
              action={step.action}
              actionLabel={step.actionLabel}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
