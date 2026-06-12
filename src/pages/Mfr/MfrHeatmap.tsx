import { useMfrFranchises } from '@/hooks/useMfrFranchises';
import { useMfrEvaluationHeatmap } from '@/hooks/useMfrEvaluationHeatmap';
import { EvaluationHeatmap } from '@/components/map/EvaluationHeatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)} mil`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

export default function MfrHeatmap() {
    const { data: franchises, isLoading } = useMfrFranchises();
    const { data: heatmapPoints, isLoading: isLoadingHeatmap } = useMfrEvaluationHeatmap();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const list = franchises ?? [];
    const points = heatmapPoints ?? [];

    const maxAvaliacoes = Math.max(...list.map(f => f.total_avaliacoes), 1);

    const getHeatColor = (avaliacoes: number) => {
        const intensity = avaliacoes / maxAvaliacoes;
        if (intensity > 0.75) return { bg: 'hsl(0 80% 50%)', text: '#fff' };
        if (intensity > 0.5) return { bg: 'hsl(30 90% 55%)', text: '#fff' };
        if (intensity > 0.25) return { bg: 'hsl(45 90% 55%)', text: 'hsl(30 50% 20%)' };
        if (intensity > 0) return { bg: 'hsl(120 40% 70%)', text: 'hsl(120 50% 20%)' };
        return { bg: 'hsl(216 20% 92%)', text: 'hsl(216 20% 40%)' };
    };

    const sorted = [...list].sort((a, b) => b.total_avaliacoes - a.total_avaliacoes);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: 'hsl(216 30% 20%)' }}>
                    Mapa de Calor — Regiões de Atuação
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Intensidade de atividade por região geográfica e por imobiliária na rede
                </p>
            </div>

            {/* Geographic Heatmap */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Mapa Geográfico de Avaliações</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {isLoadingHeatmap
                            ? 'Carregando localizações...'
                            : `${points.length} região(ões) mapeada(s)`}
                    </p>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-b-xl" style={{ height: 450 }}>
                    {isLoadingHeatmap ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : points.length > 0 ? (
                        <EvaluationHeatmap points={points} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                            Nenhuma avaliação geocodificada disponível
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Heat Legend */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">Intensidade geográfica:</span>
                        <span className="text-xs text-muted-foreground">Baixa</span>
                        <div className="h-3 w-32 rounded" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)' }} />
                        <span className="text-xs text-muted-foreground">Alta</span>
                    </div>
                </CardContent>
            </Card>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sorted.map((f) => {
                    const heat = getHeatColor(f.total_avaliacoes);
                    return (
                        <Card
                            key={f.franchise_id}
                            className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow cursor-default"
                            style={{ background: heat.bg }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: heat.text }} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate" style={{ color: heat.text }}>
                                            {f.franchise_name.replace('RE/MAX ', '').replace('Remax ', '')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium" style={{ color: heat.text, opacity: 0.8 }}>Avaliações</span>
                                        <span className="text-sm font-bold" style={{ color: heat.text }}>{f.total_avaliacoes}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium" style={{ color: heat.text, opacity: 0.8 }}>Captados</span>
                                        <span className="text-sm font-bold" style={{ color: heat.text }}>{f.total_captados}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium" style={{ color: heat.text, opacity: 0.8 }}>Corretores</span>
                                        <span className="text-sm font-bold" style={{ color: heat.text }}>{f.total_corretores}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium" style={{ color: heat.text, opacity: 0.8 }}>Valor</span>
                                        <span className="text-xs font-bold" style={{ color: heat.text }}>{formatCurrency(Number(f.valor_total_avaliado))}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {list.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Nenhuma imobiliária ativa na rede</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
