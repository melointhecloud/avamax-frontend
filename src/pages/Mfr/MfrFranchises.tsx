import { useState } from 'react';
import { useMfrFranchises, type FranchiseOverview } from '@/hooks/useMfrFranchises';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, Users, FileText, ShoppingBag, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)} mil`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

type SortKey = 'name' | 'avaliacoes' | 'captados' | 'valor' | 'corretores';

export default function MfrFranchises() {
    const { data: franchises, isLoading } = useMfrFranchises();
    const [sortBy, setSortBy] = useState<SortKey>('avaliacoes');
    const [compareA, setCompareA] = useState<string>('');
    const [compareB, setCompareB] = useState<string>('');

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const list = franchises ?? [];

    const sorted = [...list].sort((a, b) => {
        switch (sortBy) {
            case 'name': return a.franchise_name.localeCompare(b.franchise_name);
            case 'avaliacoes': return b.total_avaliacoes - a.total_avaliacoes;
            case 'captados': return b.total_captados - a.total_captados;
            case 'valor': return Number(b.valor_total_avaliado) - Number(a.valor_total_avaliado);
            case 'corretores': return b.total_corretores - a.total_corretores;
            default: return 0;
        }
    });

    const franchiseA = list.find(f => f.franchise_id === compareA);
    const franchiseB = list.find(f => f.franchise_id === compareB);

    const totals = list.reduce((acc, f) => ({
        avaliacoes: acc.avaliacoes + f.total_avaliacoes,
        captados: acc.captados + f.total_captados,
        valor: acc.valor + Number(f.valor_total_avaliado),
        corretores: acc.corretores + f.total_corretores,
    }), { avaliacoes: 0, captados: 0, valor: 0, corretores: 0 });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: 'hsl(216 30% 20%)' }}>
                    Imobiliárias da Rede
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {list.length} imobiliárias ativas na sua rede
                </p>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Building2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Imobiliárias</span>
                        </div>
                        <p className="text-2xl font-bold">{list.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-medium">Total Avaliações</span>
                        </div>
                        <p className="text-2xl font-bold">{totals.avaliacoes}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <ShoppingBag className="h-4 w-4" />
                            <span className="text-xs font-medium">Total Captados</span>
                        </div>
                        <p className="text-2xl font-bold">{totals.captados}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">Valor Total</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(totals.valor)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sort control */}
            <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <div className="flex gap-1">
                    {([
                        { key: 'avaliacoes' as SortKey, label: 'Avaliações' },
                        { key: 'captados' as SortKey, label: 'Captados' },
                        { key: 'valor' as SortKey, label: 'Valor' },
                        { key: 'corretores' as SortKey, label: 'Corretores' },
                        { key: 'name' as SortKey, label: 'Nome' },
                    ]).map(opt => (
                        <Button
                            key={opt.key}
                            variant={sortBy === opt.key ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setSortBy(opt.key)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Franchise list */}
            <div className="grid gap-3">
                {sorted.map((f, i) => (
                    <Card key={f.franchise_id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                                        style={{ background: 'hsl(216 100% 40%)' }}
                                    >
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{f.franchise_name}</p>
                                        <p className="text-xs text-muted-foreground">{f.total_corretores} corretores</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold">{f.total_avaliacoes}</p>
                                        <p className="text-[10px] text-muted-foreground">Avaliações</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold">{f.total_captados}</p>
                                        <p className="text-[10px] text-muted-foreground">Captados</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold">{formatCurrency(Number(f.valor_total_avaliado))}</p>
                                        <p className="text-[10px] text-muted-foreground">Valor</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Side by Side Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Comparativo Lado a Lado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <Select value={compareA} onValueChange={setCompareA}>
                            <SelectTrigger><SelectValue placeholder="Selecione Imobiliária A" /></SelectTrigger>
                            <SelectContent>
                                {list.map(f => (
                                    <SelectItem key={f.franchise_id} value={f.franchise_id}>{f.franchise_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={compareB} onValueChange={setCompareB}>
                            <SelectTrigger><SelectValue placeholder="Selecione Imobiliária B" /></SelectTrigger>
                            <SelectContent>
                                {list.map(f => (
                                    <SelectItem key={f.franchise_id} value={f.franchise_id}>{f.franchise_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {franchiseA && franchiseB ? (
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="font-semibold text-left">{franchiseA.franchise_name}</div>
                            <div className="text-muted-foreground font-medium">Métrica</div>
                            <div className="font-semibold text-right">{franchiseB.franchise_name}</div>

                            {[
                                { label: 'Avaliações', a: franchiseA.total_avaliacoes, b: franchiseB.total_avaliacoes },
                                { label: 'Captados', a: franchiseA.total_captados, b: franchiseB.total_captados },
                                { label: 'Corretores', a: franchiseA.total_corretores, b: franchiseB.total_corretores },
                                { label: 'Valor', a: Number(franchiseA.valor_total_avaliado), b: Number(franchiseB.valor_total_avaliado), format: true },
                            ].map(row => (
                                <div key={row.label} className="contents">
                                    <div className={`text-left py-2 px-3 rounded ${row.a > row.b ? 'bg-green-50 font-bold text-green-700' : 'bg-muted/30'}`}>
                                        {row.format ? formatCurrency(row.a) : row.a}
                                    </div>
                                    <div className="py-2 text-muted-foreground">{row.label}</div>
                                    <div className={`text-right py-2 px-3 rounded ${row.b > row.a ? 'bg-green-50 font-bold text-green-700' : 'bg-muted/30'}`}>
                                        {row.format ? formatCurrency(row.b) : row.b}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Selecione duas imobiliárias para comparar
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
