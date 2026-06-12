import { useAuth } from '@/contexts/AuthContext';
import { useMfrDashboard } from '@/hooks/useMfrDashboard';
import { useMfrPeriod } from '@/contexts/MfrPeriodContext';
import { MfrStatsCard } from '@/components/dashboard/MfrStatsCard';
import { RecentNews } from '@/components/dashboard/RecentNews';
import { FileText, TrendingUp, Building2, Users, Loader2, Calendar, ShoppingBag } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui/card';

const COLORS = ['#0047AB', '#3B82F6', '#60A5FA', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#93C5FD'];
const CHART_GRID_STROKE = 'hsl(var(--border))';
const CHART_AXIS_TICK = { fontSize: 10, fill: 'hsl(var(--muted-foreground))' };
const CHART_CATEGORY_TICK = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };
const CHART_TOOLTIP_CURSOR = {
  fill: 'hsl(var(--muted))',
  fillOpacity: 0.28,
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.35,
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `R$\u00A0${(value / 1000000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1000) return `R$\u00A0${(value / 1000).toFixed(0)}\u00A0mil`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

const normalizeTypeLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    apartamento: 'Apartamento', casa: 'Casa', terreno: 'Terreno', comercial: 'Comercial', outro: 'Outro',
  };
  return labels[tipo?.toLowerCase()] || tipo || 'Outro';
};

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-lg text-foreground">
      <p className="font-semibold mb-1">{label}</p>
      <div className="space-y-1">
        {payload.map((p: any, i: number) => {
          const formattedValue = typeof p.value === 'number' && p.name?.includes('Valor')
            ? formatCurrency(p.value)
            : p.value;

          return (
            <div key={i} className="flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name}:</span>
              <strong className="text-foreground">{formattedValue}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DonutCenterLabel = ({ viewBox, total }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground" style={{ fontSize: 28, fontWeight: 900 }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
        TOTAL
      </text>
    </g>
  );
};

const AvatarInitials = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold bg-primary/10 text-primary">
      {initials}
    </div>
  );
};

export default function MfrHome() {
  const { profile } = useAuth();
  const { period } = useMfrPeriod();
  const { data, isLoading } = useMfrDashboard(period);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data ?? {
    total_avaliacoes: 0, avaliacoes_mes_atual: 0, total_captados: 0,
    valor_total_avaliado: 0, total_corretores: 0, total_visitas_mes: 0,
    por_imobiliaria: [], por_tipo: [], valor_por_tipo: [],
    captados_por_tipo: [], corretores_por_imobiliaria: [], visitas_por_imobiliaria: [],
  };

  const porImobData = stats.por_imobiliaria.slice(0, 10).map(f => ({
    name: f.franchise_name.replace('RE/MAX ', '').replace('Remax ', ''),
    avaliacoes: f.avaliacoes, captados: f.captados,
  }));

  const porTipoData = stats.por_tipo.map(t => ({ name: normalizeTypeLabel(t.tipo), value: t.quantidade }));
  const totalTipo = porTipoData.reduce((s, d) => s + d.value, 0);

  const valorPorTipoData = stats.valor_por_tipo.map(t => ({
    name: normalizeTypeLabel(t.tipo), valor: Number(t.valor_total) || 0, quantidade: t.quantidade,
  }));

  const avgAvaliacoes = porImobData.length
    ? Math.round(porImobData.reduce((s, d) => s + d.avaliacoes, 0) / porImobData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Painel Master Franquiado
        </h2>
        <p className="text-sm mt-1 text-muted-foreground">
          Visão geral da rede — {profile?.nome || 'MFR'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MfrStatsCard
          title="Avaliações Gerais"
          value={stats.total_avaliacoes}
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
          trend={{ value: 12, label: 'vs mês ant.' }}
          sparkline={[4, 6, 5, 8, 7, 9, 8, 11, 10, 12]}
          sparklineColor="hsl(216 100% 60%)"
        />
        <MfrStatsCard
          title="Avaliações (Mês)"
          value={stats.avaliacoes_mes_atual}
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
          trend={{ value: 5, label: 'vs mês ant.' }}
          sparkline={[2, 3, 4, 3, 5, 6, 5, 7]}
          sparklineColor="hsl(216 80% 55%)"
        />
        <MfrStatsCard
          title="Valor Total Avaliado"
          value={formatCurrency(Number(stats.valor_total_avaliado))}
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
          trend={{ value: 8, label: 'crescimento' }}
          sparkline={[5, 7, 6, 9, 8, 11, 10, 14]}
          sparklineColor="hsl(43 90% 55%)"
          isGold
        />
        <MfrStatsCard
          title="Imóveis Captados"
          value={stats.total_captados}
          icon={<ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />}
          trend={{ value: 3, label: 'vs mês ant.' }}
          sparkline={[1, 2, 2, 3, 4, 3, 5, 4]}
          sparklineColor="hsl(145 70% 45%)"
        />
        <MfrStatsCard
          title="Corretores Ativos"
          value={stats.total_corretores}
          icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
          sparkline={[6, 6, 7, 7, 8, 8, 9, 9]}
          sparklineColor="hsl(175 70% 40%)"
        />
        <MfrStatsCard
          title="Visitas (Mês)"
          value={stats.total_visitas_mes}
          icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
          trend={{ value: -2, label: 'vs mês ant.' }}
          sparkline={[8, 7, 9, 6, 7, 5, 6, 5]}
          sparklineColor="hsl(0 75% 55%)"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Avaliações por Imobiliária */}
        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
            Avaliações por Imobiliária
          </h3>
          {porImobData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={porImobData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <defs>
                  <linearGradient id="barGradBlue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0047AB" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="barGradGreen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="0" horizontal={false} />
                <XAxis type="number" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={CHART_CATEGORY_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<GlassTooltip />} cursor={CHART_TOOLTIP_CURSOR} />
                <ReferenceLine x={avgAvaliacoes} stroke={CHART_GRID_STROKE} strokeDasharray="6 4" strokeWidth={1} label={{ value: 'Média', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Bar dataKey="avaliacoes" fill="url(#barGradBlue)" name="Avaliações" radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="captados" fill="url(#barGradGreen)" name="Captados" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-12 text-muted-foreground">Nenhum dado disponível</p>
          )}
        </Card>

        {/* Donut — Tipo de Imóvel */}
        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
            Avaliações por Tipo de Imóvel
          </h3>
          {porTipoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={porTipoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                >
                  {porTipoData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <DonutCenterLabel total={totalTipo} />
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(v: string) => <span className="text-[11px] text-muted-foreground">{v}</span>}
                />
                <Tooltip content={<GlassTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-12 text-muted-foreground">Nenhum dado disponível</p>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Valor por Tipo */}
        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
            Valor Avaliado por Tipo
          </h3>
          {valorPorTipoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valorPorTipoData} barCategoryGap="25%">
                <defs>
                  <linearGradient id="barGradVert" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="0" vertical={false} />
                <XAxis dataKey="name" tick={CHART_CATEGORY_TICK} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} tickCount={5} width={75} />
                <Tooltip content={<GlassTooltip />} cursor={CHART_TOOLTIP_CURSOR} />
                <Bar dataKey="valor" fill="url(#barGradVert)" name="Valor Total" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-12 text-muted-foreground">Nenhum dado disponível</p>
          )}
        </Card>

        {/* Corretores por Imobiliária */}
        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
            Corretores por Imobiliária
          </h3>
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {stats.corretores_por_imobiliaria.map((item, i) => {
              const name = item.franchise_name.replace('RE/MAX ', '').replace('Remax ', '');
              return (
                <div
                  key={i}
                  className="group/row flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-px cursor-default even:bg-muted/50"
                >
                  <AvatarInitials name={name} />
                  <span className="text-sm font-medium truncate flex-1 text-foreground">
                    {name}
                  </span>
                  <span className="glass-card px-2.5 py-0.5 text-sm font-bold rounded-full text-primary">
                    {item.total_corretores}
                  </span>
                </div>
              );
            })}
            {stats.corretores_por_imobiliaria.length === 0 && (
              <p className="text-sm text-center py-8 text-muted-foreground">Nenhum dado disponível</p>
            )}
          </div>
        </Card>
      </div>

      {/* News */}
      <Card className="p-5">
        <RecentNews />
      </Card>
    </div>
  );
}
