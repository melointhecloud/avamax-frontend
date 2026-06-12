import { useState } from 'react';
import { useMfrRankings, type RankingType } from '@/hooks/useMfrRankings';
import { useMfrAgencyRankings } from '@/hooks/useMfrAgencyRankings';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, Target, TrendingUp, Users, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)} mil`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-muted text-muted-foreground';
};

function BrokerRankingTable({ type }: { type: RankingType }) {
    const { data: ranking, isLoading } = useMfrRankings(type);

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const items = ranking ?? [];

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-12">Nenhum dado disponível</p>;
    }

    const getMetricValue = (item: typeof items[0]) => {
        switch (type) {
            case 'avaliacoes': return item.total_avaliacoes;
            case 'captacao': return item.total_captados;
            case 'valor': return formatCurrency(Number(item.valor_total));
        }
    };

    const getMetricLabel = () => {
        switch (type) {
            case 'avaliacoes': return 'Avaliações';
            case 'captacao': return 'Captações';
            case 'valor': return 'Valor Avaliado';
        }
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span>Corretor</span>
                <span className="truncate">Imobiliária</span>
                <span className="text-right">{getMetricLabel()}</span>
                <span className="text-right">Valor Captado</span>
            </div>
            {items.map((item) => (
                <div
                    key={item.user_id}
                    className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-2 items-center px-3 py-3 rounded-lg hover:bg-muted/40 transition-colors"
                >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getMedalColor(item.rank)}`}>
                        {item.rank}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={item.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                                {item.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{item.nome || 'Sem nome'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                        {item.imobiliaria.replace('RE/MAX ', '').replace('Remax ', '')}
                    </span>
                    <span className="text-sm font-bold text-right text-primary">
                        {getMetricValue(item)}
                    </span>
                    <span className="text-sm font-semibold text-right text-emerald-600">
                        {formatCurrency(Number(item.valor_captado_total))}
                    </span>
                </div>
            ))}
        </div>
    );
}

function AgencyRankingTable({ type }: { type: RankingType }) {
    const { data: ranking, isLoading } = useMfrAgencyRankings(type);

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const items = ranking ?? [];

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-12">Nenhum dado disponível</p>;
    }

    const getMetricValue = (item: typeof items[0]) => {
        switch (type) {
            case 'avaliacoes': return item.total_avaliacoes;
            case 'captacao': return item.total_captados;
            case 'valor': return formatCurrency(Number(item.valor_total));
        }
    };

    const getMetricLabel = () => {
        switch (type) {
            case 'avaliacoes': return 'Avaliações';
            case 'captacao': return 'Captações';
            case 'valor': return 'Valor Total';
        }
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[40px_1fr_80px_100px_100px] gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span>Imobiliária</span>
                <span className="text-center">Corretores</span>
                <span className="text-right">{getMetricLabel()}</span>
                <span className="text-right">Valor Captado</span>
            </div>
            {items.map((item) => (
                <div
                    key={item.franchise_name}
                    className="grid grid-cols-[40px_1fr_80px_100px_100px] gap-2 items-center px-3 py-3 rounded-lg hover:bg-muted/40 transition-colors"
                >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getMedalColor(item.rank)}`}>
                        {item.rank}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate">
                            {item.franchise_name.replace('RE/MAX ', '').replace('Remax ', '')}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground text-center">
                        {item.total_corretores}
                    </span>
                    <span className="text-sm font-bold text-right text-primary">
                        {getMetricValue(item)}
                    </span>
                    <span className="text-sm font-semibold text-right text-emerald-600">
                        {formatCurrency(Number(item.valor_captado_total))}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function MfrRankings() {
    const [metricTab, setMetricTab] = useState<RankingType>('avaliacoes');
    const [viewTab, setViewTab] = useState<'corretores' | 'imobiliarias'>('corretores');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Rankings da Rede
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Compare o desempenho de corretores e imobiliárias da sua rede
                </p>
            </div>

            {/* Toggle Corretores / Imobiliárias */}
            <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'corretores' | 'imobiliarias')}>
                <TabsList className="grid w-full max-w-sm grid-cols-2">
                    <TabsTrigger value="corretores" className="gap-2">
                        <Users className="h-4 w-4" />
                        Corretores
                    </TabsTrigger>
                    <TabsTrigger value="imobiliarias" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Imobiliárias
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="corretores" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Tabs value={metricTab} onValueChange={(v) => setMetricTab(v as RankingType)}>
                                <div className="border-b px-4 pt-4">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="avaliacoes" className="gap-2">
                                            <Trophy className="h-4 w-4" />
                                            <span className="hidden sm:inline">Avaliações</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="captacao" className="gap-2">
                                            <Target className="h-4 w-4" />
                                            <span className="hidden sm:inline">Captação</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="valor" className="gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="hidden sm:inline">Valor Avaliado</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <div className="p-4">
                                    <TabsContent value="avaliacoes" className="mt-0">
                                        <BrokerRankingTable type="avaliacoes" />
                                    </TabsContent>
                                    <TabsContent value="captacao" className="mt-0">
                                        <BrokerRankingTable type="captacao" />
                                    </TabsContent>
                                    <TabsContent value="valor" className="mt-0">
                                        <BrokerRankingTable type="valor" />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="imobiliarias" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Tabs value={metricTab} onValueChange={(v) => setMetricTab(v as RankingType)}>
                                <div className="border-b px-4 pt-4">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="avaliacoes" className="gap-2">
                                            <Trophy className="h-4 w-4" />
                                            <span className="hidden sm:inline">Avaliações</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="captacao" className="gap-2">
                                            <Target className="h-4 w-4" />
                                            <span className="hidden sm:inline">Captação</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="valor" className="gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="hidden sm:inline">Valor Total</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <div className="p-4">
                                    <TabsContent value="avaliacoes" className="mt-0">
                                        <AgencyRankingTable type="avaliacoes" />
                                    </TabsContent>
                                    <TabsContent value="captacao" className="mt-0">
                                        <AgencyRankingTable type="captacao" />
                                    </TabsContent>
                                    <TabsContent value="valor" className="mt-0">
                                        <AgencyRankingTable type="valor" />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
