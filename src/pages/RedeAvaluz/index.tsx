import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEvaluationHeatmap } from '@/hooks/useEvaluationHeatmap';
import { EvaluationHeatmap } from '@/components/map/EvaluationHeatmap';
import { Leaderboard } from '@/components/network/Leaderboard';
import { GamificationStats } from '@/components/network/GamificationStats';
import { Globe, MapPin, Loader2 } from 'lucide-react';

const RedeAvaluz = () => {
  const { data: points = [], isLoading, error } = useEvaluationHeatmap();

  const totalEvals = points.reduce((sum, p) => sum + p.count, 0);
  const uniqueCities = new Set(points.map(p => p.municipio)).size;

  return (
    <DashboardLayout title="Rede Avaluz" subtitle="Densidade geográfica das avaliações do seu time">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rede Avaluz</h1>
              <p className="text-sm text-muted-foreground">Densidade geográfica das avaliações do seu time</p>
            </div>
          </div>

          {!isLoading && points.length > 0 && (
            <div className="flex gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{totalEvals} avaliações</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{uniqueCities} cidades</span>
              </div>
            </div>
          )}
        </div>

        {/* Gamification Stats */}
        <GamificationStats />

        {/* Main Content - Map + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map Section - Left (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm" style={{ height: 500, minHeight: 400 }}>
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Carregando mapa de calor...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-destructive">Erro ao carregar dados do mapa.</p>
                </div>
              ) : points.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <MapPin className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Nenhuma avaliação encontrada para exibir no mapa.</p>
                    <p className="text-xs text-muted-foreground/70">Avalie imóveis para vê-los no mapa de calor.</p>
                  </div>
                </div>
              ) : (
                <EvaluationHeatmap points={points} />
              )}
            </div>

            {/* Legend */}
            {points.length > 0 && (
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <span className="text-xs font-medium text-muted-foreground">Intensidade:</span>
                <span className="text-xs text-muted-foreground">Baixa</span>
                <div className="h-3 w-32 rounded" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)' }} />
                <span className="text-xs text-muted-foreground">Alta</span>
              </div>
            )}
          </div>

          {/* Leaderboard Section - Right (2 columns) */}
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RedeAvaluz;
