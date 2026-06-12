import { useState } from 'react';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp, FileText, Globe, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { useTeamDashboard } from '@/hooks/useTeamDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { OnboardingChecklist } from '@/components/team/OnboardingChecklist';
import { EvaluationsTimelineChart } from '@/components/dashboard/EvaluationsTimelineChart';
const CATEGORY_COLORS: Record<string, string> = {
  'APARTAMENTO': 'hsl(24, 100%, 50%)',      // Laranja
  'CASA': 'hsl(142, 71%, 45%)',             // Verde
  'TERRENO': 'hsl(262, 83%, 58%)',          // Roxo
  'COMERCIAL': 'hsl(199, 89%, 48%)',        // Azul
  'SALA_COMERCIAL': 'hsl(199, 70%, 60%)',   // Azul claro
  'GALPAO': 'hsl(45, 93%, 47%)',            // Amarelo
  'KITNET': 'hsl(340, 82%, 52%)',           // Rosa
  'COBERTURA': 'hsl(173, 80%, 40%)',        // Teal
  'FLAT': 'hsl(280, 65%, 60%)',             // Lilás
  'LOFT': 'hsl(15, 80%, 55%)',              // Coral
  'RURAL': 'hsl(120, 50%, 40%)',            // Verde escuro
  'CHACARA': 'hsl(90, 60%, 45%)',           // Verde lima
  'SITIO': 'hsl(75, 55%, 50%)',             // Oliva
  'Outros': 'hsl(var(--team-muted))',       // Fallback
};

const LOCATION_COLORS = [
  'bg-team-orange',
  'bg-team-primary', 
  'bg-team-muted',
  'bg-green-500',
  'bg-purple-500',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculatePercentChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function DashboardSkeleton() {
  return (
    <TeamDashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-1">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-team-border bg-team-card">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-16 bg-team-muted/20" />
                <Skeleton className="mt-2 h-8 w-20 bg-team-muted/20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-team-border bg-team-card lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32 bg-team-muted/20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full bg-team-muted/20" />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-team-border bg-team-card">
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full bg-team-muted/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </TeamDashboardLayout>
  );
}


export default function TeamHome() {
  const [chartPeriod] = useState('6m');
  const { data: stats, isLoading, error } = useTeamDashboard(chartPeriod as any);
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  
  if (error || !stats) {
    return (
      <TeamDashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-team-muted">Erro ao carregar dashboard. Tente novamente.</p>
        </div>
      </TeamDashboardLayout>
    );
  }

  const creditosRestantes = (stats.team_info?.monthly_credits ?? 0) - stats.creditos_usados;
  const taxaConversao = stats.total_avaliacoes > 0 
    ? ((stats.total_convertidos / stats.total_avaliacoes) * 100).toFixed(1)
    : '0';
  const crescimento = calculatePercentChange(stats.avaliacoes_mes_atual, stats.avaliacoes_mes_anterior);

  const statsCards = [
    {
      title: 'Avaliações (total)',
      value: stats.total_avaliacoes.toLocaleString('pt-BR'),
      change: crescimento,
      icon: FileText,
    },
    {
      title: 'Créditos Restantes',
      value: creditosRestantes.toLocaleString('pt-BR'),
      change: `${stats.creditos_usados} usados`,
      icon: CreditCard,
    },
    {
      title: 'Taxa de Conversão (total)',
      value: `${taxaConversao}%`,
      change: `${stats.total_convertidos} convertidos`,
      icon: Percent,
    },
    {
      title: 'Crescimento',
      value: crescimento,
      change: `${stats.avaliacoes_mes_atual} este mês`,
      icon: TrendingUp,
    },
  ];


  const pieData = stats.category_distribution.map(cat => ({
    name: cat.name || 'Outros',
    value: cat.value,
    color: CATEGORY_COLORS[cat.name?.toUpperCase()] || CATEGORY_COLORS['Outros'],
  }));

  const totalPie = pieData.reduce((acc, item) => acc + item.value, 0);
  const mainPercentage = pieData.length > 0 
    ? ((pieData[0].value / totalPie) * 100).toFixed(1)
    : '0';

  return (
    <TeamDashboardLayout>
      {/* Onboarding Checklist */}
      <OnboardingChecklist />
      <div className="grid gap-4 lg:grid-cols-3 min-w-0">
        {/* Stats Cards - 2x2 grid */}
        <div className="grid gap-3 grid-cols-2 lg:col-span-1 min-w-0">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className="border-team-border bg-team-card min-w-0 overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-team-muted leading-tight">{stat.title}</p>
                <div className="mt-1 sm:mt-2 min-w-0">
                  <span className="text-xl sm:text-2xl font-bold text-team-foreground block">{stat.value}</span>
                  <span className={`flex items-center text-[10px] sm:text-xs mt-0.5 ${stat.change.startsWith('+') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-400' : 'text-team-muted'}`}>
                    {stat.change}
                    {(stat.change.startsWith('+') || stat.change.startsWith('-')) && (
                      <TrendingUp className="ml-0.5 h-3 w-3 shrink-0" />
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Curva de Crescimento - Timeline Chart */}
        <div className="lg:col-span-2 min-w-0">
          <EvaluationsTimelineChart />
        </div>
      </div>

      {/* Property Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.recent_properties.length > 0 ? (
          stats.recent_properties.slice(0, 3).map((property) => (
            <Card key={property.id} className="overflow-hidden border-team-border bg-team-card">
              <div className="flex">
                <div className="h-32 w-32 flex-shrink-0 bg-team-muted/20">
                  {property.image ? (
                    <img 
                      src={property.image} 
                      alt={property.address}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText className="h-8 w-8 text-team-muted" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <h3 className="text-sm font-semibold text-team-foreground">{property.address}</h3>
                    <p className="mt-0.5 text-xs text-team-muted line-clamp-2">{property.description}</p>
                    {property.convertido && (
                      <span className="mt-1 inline-flex items-center rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                        Convertido
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-team-foreground">{formatCurrency(property.value)}</p>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full bg-team-orange text-white hover:bg-team-orange/90 text-xs h-8"
                      onClick={() => navigate(`/avaliacao/${property.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-team-border bg-team-card">
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-sm text-team-muted">Nenhuma avaliação recente</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Section - Table and Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3 min-w-0">

        {/* Table */}
        <Card className="border-team-border bg-team-card lg:col-span-1 min-w-0 overflow-hidden">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm font-semibold text-team-foreground">Top Avaliações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-team-border">
              {/* Header - hidden on very small screens */}
              <div className="hidden sm:grid grid-cols-4 gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-team-muted">
                <span>Imóvel</span>
                <span>Valor</span>
                <span>Data</span>
                <span>Status</span>
              </div>
              {stats.top_avaliacoes.length > 0 ? (
                stats.top_avaliacoes.map((row, i) => (
                  <div key={i} className="px-3 sm:px-4 py-2.5 min-w-0">
                    {/* Mobile: stacked layout */}
                    <div className="sm:hidden space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-team-foreground">{row.name}</span>
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${
                          row.convertido 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-team-orange/20 text-team-orange'
                        }`}>
                          {row.convertido ? 'Convertido' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-team-foreground font-medium">{formatCurrency(row.price)}</span>
                        <span className="text-team-muted">{row.date}</span>
                      </div>
                    </div>
                    {/* Desktop: grid layout */}
                    <div className="hidden sm:grid grid-cols-4 gap-2 text-xs min-w-0">
                      <span className="text-team-foreground truncate">{row.name}</span>
                      <span className="text-team-foreground">{formatCurrency(row.price)}</span>
                      <span className="text-team-muted">{row.date}</span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium w-fit ${
                        row.convertido 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-team-orange/20 text-team-orange'
                      }`}>
                        {row.convertido ? 'Convertido' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-xs text-team-muted">
                  Nenhuma avaliação ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Category Distribution */}
        <Card className="border-team-border bg-team-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-team-foreground">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <div className="relative h-32 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-team-foreground">{mainPercentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-team-muted">{item.name}</span>
                      </div>
                      <span className="text-team-foreground shrink-0">{item.value} avaliações</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-team-muted">Sem dados de categorias</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Stats */}
        <Card className="border-team-border bg-team-card min-w-0 overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm font-semibold text-team-foreground">Avaliações por Cidade</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex h-20 sm:h-24 items-center justify-center">
              <Globe className="h-12 w-12 sm:h-16 sm:w-16 text-team-muted/30" />
            </div>
            {stats.location_stats.length > 0 ? (
              <div className="mt-3 sm:mt-4 space-y-2">
                {stats.location_stats.map((loc, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-2 w-2 rounded-full shrink-0 mt-1 ${LOCATION_COLORS[i] || 'bg-team-muted'}`} />
                      <span className="text-xs text-team-orange break-words">{loc.city}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-team-foreground block">{loc.count}</span>
                      <span className="text-[10px] text-team-muted">{formatCurrency(loc.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center text-xs text-team-muted">
                Sem dados de localização
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </TeamDashboardLayout>
  );
}
