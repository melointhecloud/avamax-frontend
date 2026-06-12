import { ReactNode } from 'react';
import { Star } from 'lucide-react';

interface MfrStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  sparkline?: number[];
  sparklineColor?: string;
  isGold?: boolean;
}

export function MfrStatsCard({
  title,
  value,
  icon,
  trend,
  sparkline = [3, 5, 4, 7, 6, 8, 7, 9, 8, 10],
  sparklineColor = 'hsl(216 100% 70%)',
  isGold = false,
}: MfrStatsCardProps) {
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const points = sparkline
    .map((v, i) => {
      const x = (i / (sparkline.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="neu-card group relative overflow-hidden p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="glass-card relative h-full p-4">
        {/* Sparkline background */}
        <svg
          className="absolute bottom-0 right-0 opacity-[0.08] pointer-events-none"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <polyline
            points={points}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Gold star badge */}
        {isGold && (
          <div className="absolute -top-1 -right-1 gold-glow rounded-full p-1.5 bg-amber-50 dark:bg-amber-900/30">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
          </div>
        )}

        {/* Icon */}
        <div className="mb-3 inline-flex items-center justify-center rounded-lg p-2 bg-destructive/10">
          <span className="text-destructive">{icon}</span>
        </div>

        {/* Value */}
        <p className="text-xl sm:text-2xl font-black leading-none tracking-tight text-foreground whitespace-nowrap">
          {value}
        </p>

        {/* Title */}
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>

        {/* Trend */}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className="text-xs font-bold"
              style={{
                color: trend.value >= 0 ? 'hsl(145 70% 38%)' : 'hsl(0 75% 55%)',
              }}
            >
              {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
