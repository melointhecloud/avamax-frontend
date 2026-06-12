import { cn } from '@/lib/utils';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';

interface AchievementNodeProps {
  achievement: Achievement | TeamAchievement;
  isSelected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementNode({ achievement, isSelected, onClick, size = 'md' }: AchievementNodeProps) {
  const { isUnlocked, icon, progress } = achievement;
  // isNext: not unlocked but has at least 70% progress
  const isNext = !isUnlocked && progress.current >= progress.target * 0.7;
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-18 h-18 text-2xl',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-300 border-2',
        sizeClasses[size],
        // Unlocked: golden glow, no pulse
        isUnlocked && 'bg-gradient-to-br from-team-orange to-amber-500 border-amber-400 shadow-glow cursor-pointer',
        // Next: slow glow animation (NOT animate-pulse)
        !isUnlocked && isNext && 'bg-team-accent border-team-orange/50 animate-glow-slow cursor-pointer',
        // Locked: dimmed, no animation
        !isUnlocked && !isNext && 'bg-team-accent/50 border-team-border opacity-50 cursor-pointer',
        // Selected ring
        isSelected && 'ring-2 ring-team-orange ring-offset-2 ring-offset-team-background scale-110'
      )}
    >
      {isUnlocked ? (
        <span className="filter drop-shadow-lg">{icon}</span>
      ) : (
        <span className="opacity-40 grayscale">{icon}</span>
      )}
      
      {/* Progress indicator ring */}
      {!isUnlocked && progress.current > 0 && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            className="stroke-team-orange/30"
            fill="none"
            strokeWidth="2"
            r="16"
            cx="18"
            cy="18"
          />
          <circle
            className="stroke-team-orange transition-all duration-500"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            r="16"
            cx="18"
            cy="18"
            strokeDasharray={`${Math.min(100, (progress.current / progress.target) * 100)} 100`}
          />
        </svg>
      )}
      
      {/* Unlocked checkmark */}
      {isUnlocked && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-team-background">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}