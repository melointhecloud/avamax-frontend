import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantPrefix } from '@/hooks/useTenantPrefix';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useTeamAnalytics, AnalyticsPeriod } from '@/hooks/useTeamAnalytics';
import { useTeamSubscription } from '@/hooks/useTeamSubscription';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Award,
  MapPin,
  PieChart as PieChartIcon,
  BarChart3,
  Lock,
  ArrowUpRight,
} from 'lucide-react';

const COLORS = [
  'hsl(14 90% 55%)',    // Red/orange — apartamento
  'hsl(145 63% 42%)',   // Green — casa
  'hsl(270 60% 55%)',   // Purple — terreno
  'hsl(187 72% 50%)',   // Cyan/teal — cobertura
  'hsl(215 90% 55%)',   // Blue — comercial
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

function AnalyticsSkeleton() {
  return (
    <TeamDashboardLayout title="Analytics" subtitle="Métricas avançadas do time">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-team-border bg-team-card">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 bg-team-muted/20" />
                <Skeleton className="mt-2 h-8 w-24 bg-team-muted/20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-team-border bg-team-card">
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full bg-team-muted/20" />
            </CardContent>
          </Card>
          <Card className="border-team-border bg-team-card">
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full bg-team-muted/20" />
            </CardContent>
          </Card>
        </div>
      </div>
    </TeamDashboardLayout>
  );
}

function UpgradePrompt() {
  const navigate = useNavigate();
  const prefix = useTenantPrefix();
  
  return (
    <TeamDashboardLayout title="Analytics" subtitle="Métricas avançadas do time">
      <Card className="border-team-border bg-team-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-team-orange/10">
            <Lock className="h-8 w-8 text-team-orange" />
          </div>
          <h2 className="text-xl font-bold text-team-foreground">
            Analytics Avançado
          </h2>
          <p className="mt-2 max-w-md text-team-muted">
            O Dashboard de Analytics está disponível exclusivamente para o plano Imobiliária. 
            Faça upgrade para ter acesso a métricas detalhadas por membro, gráficos de evolução e ranking de performance.
          </p>
          <Button
            className="mt-6 bg-team-orange text-white hover:bg-team-orange/90"
            onClick={() => navigate(prefix('/creditos'))}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Ver planos
          </Button>
        </CardContent>
      </Card>
    </TeamDashboardLayout>
  );
}

export default function TeamAnalytics() {
  const navigate = useNavigate();
  const prefix = useTenantPrefix();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { data, isLoading, isImobiliaria, hasError, errorMessage } = useTeamAnalytics(period);

  if (!isImobiliaria) {
    return <UpgradePrompt />;
  }

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (hasError || !data) {
    return (
      <TeamDashboardLayout title="Analytics" subtitle="Métricas avançadas do time">
        <Card className="border-team-border bg-team-card">
          <CardContent className="py-16 text-center">
            <p className="text-team-muted">{errorMessage || 'Erro ao carregar analytics'}</p>
          </CardContent>
        </Card>
      </TeamDashboardLayout>
    );
  }

  const totals = data.totals;
  const memberStats = data.member_stats || [];
  const ranking = data.ranking || [];
  const monthlyEvolution = data.monthly_evolution || [];
  const categoryDistribution = data.category_distribution || [];
  const geographicDistribution = data.geographic_distribution || [];

  return (
    <TeamDashboardLayout title="Analytics" subtitle="Métricas avançadas do time">
      <div className="w-full min-w-0 overflow-hidden">
      {/* Period Selector */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-team-foreground">Visão Geral</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
          <SelectTrigger className="w-[140px] border-team-border bg-team-card text-team-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-team-orange/10">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-team-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-team-muted truncate">Total Avaliações</p>
                <p className="text-lg sm:text-2xl font-bold text-team-foreground">{totals.total_avaliacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-team-muted truncate">Taxa de Conversão</p>
                <p className="text-lg sm:text-2xl font-bold text-team-foreground">{totals.taxa_conversao}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-team-primary/10">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-team-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-team-muted truncate">Valor Médio</p>
                <p className="text-lg sm:text-2xl font-bold text-team-foreground">{formatCompactCurrency(totals.valor_medio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-team-muted truncate">Créditos Usados</p>
                <p className="text-lg sm:text-2xl font-bold text-team-foreground">{totals.creditos_usados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Monthly Evolution */}
        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
              <TrendingUp className="h-4 w-4 text-team-orange" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {monthlyEvolution.length > 0 ? (
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyEvolution}>
                    <XAxis 
                      dataKey="month_label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--team-muted))', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--team-muted))', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--team-card))', 
                        border: '1px solid hsl(var(--team-border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avaliacoes" 
                      stroke="hsl(var(--team-orange))" 
                      strokeWidth={2} 
                      dot={{ fill: 'hsl(var(--team-orange))' }}
                      name="Avaliações"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="convertidos" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={{ fill: '#22c55e' }}
                      name="Convertidos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-team-muted">Sem dados de evolução</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
              <PieChartIcon className="h-4 w-4 text-team-orange" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {categoryDistribution.length > 0 ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-40 w-40 shrink-0 sm:h-48 sm:w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        dataKey="count"
                        nameKey="categoria"
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full flex-1 space-y-2">
                  {categoryDistribution.slice(0, 5).map((cat, i) => (
                    <div key={cat.categoria} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 shrink-0 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                        />
                        <span className="text-team-foreground truncate">{cat.categoria}</span>
                      </div>
                      <span className="text-team-muted shrink-0 ml-2">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-team-muted">Sem dados de categorias</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Performance & Ranking */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        {/* Member Performance */}
        <Card className="border-team-border bg-team-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
              <Users className="h-4 w-4 text-team-orange" />
              Performance por Membro
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {memberStats.length > 0 ? (
              (() => {
                // Calcular o máximo de avaliações entre membros para barra de progresso proporcional
                const maxAvaliacoes = Math.max(...memberStats.map(m => m.total_avaliacoes), 1);
                
                return (
                  <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
                    {memberStats.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-2 sm:gap-4">
                        <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-team-primary text-team-primary-foreground text-xs">
                            {member.nome?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium text-team-foreground truncate">
                              {member.nome || 'Usuário'}
                            </span>
                            <span className="text-[10px] sm:text-xs text-team-muted shrink-0 ml-1">
                              {member.total_avaliacoes} aval.
                            </span>
                          </div>
                          <Progress 
                            value={(member.total_avaliacoes / maxAvaliacoes) * 100} 
                            className="h-1.5 sm:h-2" 
                          />
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-semibold text-team-orange">
                            {member.taxa_conversao}%
                          </p>
                          <p className="text-[10px] sm:text-xs text-team-muted">conv.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-team-muted">Sem dados de membros</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card className="border-team-border bg-team-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
              <Award className="h-4 w-4 text-team-orange" />
              Top 5 Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {ranking.length > 0 ? (
              <div className="space-y-3">
                {ranking.map((member, index) => (
                    <button 
                      key={member.user_id} 
                      onClick={() => navigate(prefix(`/time/member/${member.user_id}`))}
                      className="flex w-full items-center gap-2 sm:gap-3 rounded-lg border border-team-border bg-team-accent/20 p-2 sm:p-3 text-left transition-all hover:bg-team-accent/40"
                    >
                      <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs sm:text-sm ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-300 text-black' :
                        index === 2 ? 'bg-orange-400 text-black' :
                        'bg-team-muted/30 text-team-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-team-primary text-team-primary-foreground text-[10px] sm:text-xs">
                          {member.nome?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-team-foreground truncate">
                          {member.nome || 'Usuário'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-team-muted">
                          {member.avaliacoes} aval.
                        </p>
                      </div>
                    </button>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-team-muted">Sem dados de ranking</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-team-border bg-team-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
            <MapPin className="h-4 w-4 text-team-orange" />
            Distribuição Geográfica (Top 10)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {geographicDistribution.length > 0 ? (
            <div className="h-64 overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={350}>
                <BarChart data={geographicDistribution} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--team-muted))', fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="cidade" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--team-muted))', fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--team-card))', 
                      border: '1px solid hsl(var(--team-border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--team-orange))" radius={[0, 4, 4, 0]} name="Avaliações" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-team-muted">Sem dados geográficos</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </TeamDashboardLayout>
  );
}
