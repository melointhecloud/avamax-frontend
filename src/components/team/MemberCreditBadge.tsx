import { AddCreditsDialog } from './AddCreditsDialog';

interface MemberCreditBadgeProps {
  allocatedCredits: number;
  isOwner: boolean;
  canManage: boolean;
  availablePool: number;
  memberId: string;
  memberName: string;
  teamId: string;
  onSuccess: () => void;
  showBadge?: boolean;
}

export function MemberCreditBadge({
  allocatedCredits,
  isOwner,
  canManage,
  availablePool,
  memberId,
  memberName,
  teamId,
  onSuccess,
  showBadge = true,
}: MemberCreditBadgeProps) {
  // Owner doesn't have allocated credits - they use the pool directly
  if (isOwner) {
    return null;
  }

  // If showBadge is false, only show the add button
  if (!showBadge) {
    return canManage ? (
      <AddCreditsDialog
        memberName={memberName}
        memberId={memberId}
        teamId={teamId}
        currentCredits={allocatedCredits}
        availablePool={availablePool}
        onSuccess={onSuccess}
      />
    ) : null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Credit badge */}
      <div className="flex items-center gap-1 rounded-lg border border-team-border bg-team-accent/30 px-2 py-1">
        <span className="text-sm font-bold text-team-foreground">
          {allocatedCredits}
        </span>
        <span className="text-xs text-team-muted">créditos</span>
      </div>

      {/* Add button - only if can manage */}
      {canManage && (
        <AddCreditsDialog
          memberName={memberName}
          memberId={memberId}
          teamId={teamId}
          currentCredits={allocatedCredits}
          availablePool={availablePool}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
