import { useAuth } from '@/contexts/AuthContext';
import { useCeoDashboard } from '@/hooks/useCeoDashboard';
import { useCeoPeriod } from '@/contexts/CeoPeriodContext';
import { MfrStatsCard } from '@/components/dashboard/MfrStatsCard';
import { RecentNews } from '@/components/dashboard/RecentNews';
import { FileText, TrendingUp, Building2, Users, Loader2, Calendar, ShoppingBag } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from 'recharts';

const COLORS = ['#0047AB', '#3B82F6', '#60A5FA', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#93C5FD'];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)} mil`;
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
    <div className="glass-card px-3 py-2 text-xs shadow-lg" style={{ color: 'hsl(216 30% 20%)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name?.includes('Valor') ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const DonutCenterLabel = ({ viewBox, total }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-current" style={{ fontSize: 28, fontWeight: 900, fill: 'hsl(216 30% 18%)' }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: 'hsl(216 15% 55%)', letterSpacing: '0.08em' }}>
        TOTAL
      </text>
    </g>
  );
};

const AvatarInitials = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={{ background: 'hsl(216 100% 94%)', color: 'hsl(216 100% 40%)' }}
    >
      {initials}
    </div>
  );
};

export default function CeoHome() {
  const { profile } = useAuth();
  const { period } = useCeoPeriod();
  const { data, isLoading } = useCeoDashboard(period);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'hsl(216 100% 40%)' }} />
      </div>
    );
  }

  const stats = data ?? {
    total_avaliacoes: 0, avaliacoes_mes_atual: 0, total_captados: 0,
    valor_total_avaliado: 0, total_corretores: 0, total_visitas_mes: 0,
    por_imobiliaria: [], por_tipo: [], valor_por_tipo: [],
    captados_por_tipo: [], corretores_por_imobiliaria: [], visitas_por_imobiliaria: [],
  };

  const porImobData = stats.por_imobiliaria.slice(0, 10).map((f: any) => ({
    name: f.franchise_name.replace('RE/MAX ', '').replace('Remax ', ''),
    avaliacoes: f.avaliacoes, captados: f.captados,
  }));

  const porTipoData = stats.por_tipo.map((t: any) => ({ name: normalizeTypeLabel(t.tipo), value: t.quantidade }));
  const totalTipo = porTipoData.reduce((s: number, d: any) => s + d.value, 0);

  const valorPorTipoData = stats.valor_por_tipo.map((t: any) => ({
    name: normalizeTypeLabel(t.tipo), valor: Number(t.valor_total) || 0, quantidade: t.quantidade,
  }));

  const avgAvaliacoes = porImobData.length
    ? Math.round(porImobData.reduce((s: number, d: any) => s + d.avaliacoes, 0) / porImobData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'hsl(216 30% 20%)' }}>
            Painel CEO
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(216 15% 50%)' }}>
            Visão Global da Rede Avaluz
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MfrStatsCard
          title="Avaliações Globais"
          value={stats.total_avaliacoes}
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
          sparkline={[4, 6, 5, 8, 7, 9, 8, 11, 10, 12]}
          sparklineColor="hsl(216 100% 60%)"
        />
        <MfrStatsCard
          title="Avaliações (Mês)"
          value={stats.avaliacoes_mes_atual}
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
          sparkline={[2, 3, 4, 3, 5, 6, 5, 7]}
          sparklineColor="hsl(216 80% 55%)"
        />
        <MfrStatsCard
          title="Valor Total Avaliado"
          value={formatCurrency(Number(stats.valor_total_avaliado))}
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
          sparkline={[5, 7, 6, 9, 8, 11, 10, 14]}
          sparklineColor="hsl(43 90% 55%)"
          isGold
        />
        <MfrStatsCard
          title="Imóveis Captados"
          value={stats.total_captados}
          icon={<ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />}
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
          sparkline={[8, 7, 9, 6, 7, 5, 6, 5]}
          sparklineColor="hsl(0 75% 55%)"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="neu-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'hsl(216 30% 25%)' }}>
            Top 10 Imobiliárias
          </h3>
          {porImobData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={porImobData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <defs>
                  <linearGradient id="barGradBlue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0047AB" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(216 20% 94%)" strokeDasharray="0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(216 15% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: 'hsl(216 20% 35%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlassTooltip />} />
                <ReferenceLine x={avgAvaliacoes} stroke="hsl(216 15% 75%)" strokeDasharray="6 4" strokeWidth={1} label={{ value: 'Média', fontSize: 9, fill: 'hsl(216 15% 60%)' }} />
                <Bar dataKey="avaliacoes" fill="url(#barGradBlue)" name="Avaliações" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-12" style={{ color: 'hsl(216 15% 55%)' }}>Nenhum dado disponível. O backend do CEO está em construção.</p>
          )}
        </div>

        <div className="neu-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'hsl(216 30% 25%)' }}>
            Avaliações Globais por Tipo
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
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {porTipoData.map((_, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <DonutCenterLabel total={totalTipo} />
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: 11, color: 'hsl(216 20% 35%)' }}>{v}</span>} />
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-12" style={{ color: 'hsl(216 15% 55%)' }}>Mock data backend not implemented yet.</p>
          )}
        </div>
      </div>

      <div className="neu-card p-5">
        <RecentNews />
      </div>
    </div>
  );
}
