import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenantPrefix } from '@/hooks/useTenantPrefix';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
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
import { useMemberAnalytics, AnalyticsPeriod } from '@/hooks/useMemberAnalytics';
import {
  ArrowLeft,
  BarChart3,
  Target,
  DollarSign,
  CreditCard,
  TrendingUp,
  MapPin,
  Calendar,
  Award,
  Lock,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(var(--team-orange))', 'hsl(var(--team-primary))', '#22c55e', '#8b5cf6', '#ec4899'];

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

function ProfileSkeleton() {
  return (
    <TeamDashboardLayout title="Perfil do Corretor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full bg-team-muted/20" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-team-muted/20" />
            <Skeleton className="h-4 w-32 bg-team-muted/20" />
          </div>
        </div>
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
      </div>
    </TeamDashboardLayout>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  
  return (
    <TeamDashboardLayout title="Perfil do Corretor">
      <Card className="border-team-border bg-team-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-team-orange/10">
            <Lock className="h-8 w-8 text-team-orange" />
          </div>
          <h2 className="text-xl font-bold text-team-foreground">
            Análise Individual
          </h2>
          <p className="mt-2 max-w-md text-team-muted">
            A análise detalhada por corretor está disponível para os planos Broker e Imobiliária.
            Faça upgrade para acessar métricas individuais de cada membro do time.
          </p>
          <Button
            className="mt-6 bg-team-orange text-white hover:bg-team-orange/90"
            onClick={() => navigate('/creditos')}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Ver planos
          </Button>
        </CardContent>
      </Card>
    </TeamDashboardLayout>
  );
}

export default function TeamMemberProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const prefix = useTenantPrefix();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { data, isLoading, isBrokerOrImobiliaria, isImobiliaria, hasError, errorMessage } = useMemberAnalytics(userId, period);

  if (!isBrokerOrImobiliaria) {
    return <AccessDenied />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (hasError || !data || !data.member) {
    return (
      <TeamDashboardLayout title="Perfil do Corretor">
        <Card className="border-team-border bg-team-card">
          <CardContent className="py-16 text-center">
            <p className="text-team-muted">{errorMessage || 'Corretor não encontrado ou sem permissão'}</p>
            <Button
              variant="ghost"
              className="mt-4 text-team-orange hover:text-team-orange/80"
              onClick={() => navigate(prefix('/time/members'))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para membros
            </Button>
          </CardContent>
        </Card>
      </TeamDashboardLayout>
    );
  }

  const { member, stats, monthly_evolution, category_distribution, geographic_distribution, recent_evaluations, team_comparison } = data;

  return (
    <TeamDashboardLayout title="Perfil do Corretor">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 text-team-muted hover:text-team-foreground"
        onClick={() => navigate(prefix('/time/members'))}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para membros
      </Button>

      {/* Header Card */}
      <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-team-primary text-team-primary-foreground text-xl">
                  {member.nome?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-team-foreground">
                    {member.nome || 'Usuário'}
                  </h1>
                  <Badge 
                    variant={member.is_owner ? 'default' : 'secondary'}
                    className={member.is_owner ? 'bg-team-orange text-white' : 'bg-team-accent text-team-foreground'}
                  >
                    {member.is_owner ? 'Admin' : 'Corretor'}
                  </Badge>
                </div>
                <p className="text-sm text-team-muted">{member.email}</p>
                {member.creci && (
                  <p className="text-xs text-team-muted mt-1">CRECI: {member.creci}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-team-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Desde {format(new Date(member.created_at), 'MMM yyyy', { locale: ptBR })}
                  </span>
                  {!member.is_owner && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {member.allocated_credits} créditos
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Period Selector */}
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
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-team-border bg-team-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-team-orange/10">
                <BarChart3 className="h-5 w-5 text-team-orange" />
              </div>
              <div>
                <p className="text-xs text-team-muted">Avaliações</p>
                <p className="text-2xl font-bold text-team-foreground">{stats.total_avaliacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-team-muted">Conversão</p>
                <p className="text-2xl font-bold text-team-foreground">{stats.taxa_conversao}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-team-primary/10">
                <DollarSign className="h-5 w-5 text-team-primary" />
              </div>
              <div>
                <p className="text-xs text-team-muted">Valor Médio</p>
                <p className="text-2xl font-bold text-team-foreground">{formatCompactCurrency(stats.valor_medio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <CreditCard className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-team-muted">Créditos Usados</p>
                <p className="text-2xl font-bold text-team-foreground">{stats.creditos_usados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Comparison Card */}
      <Card className="mb-6 border-team-border bg-team-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-team-orange font-bold text-white text-lg">
                #{team_comparison.member_rank}
              </div>
              <div>
                <p className="font-semibold text-team-foreground">
                  Posição no Ranking
                </p>
                <p className="text-sm text-team-muted">
                  de {team_comparison.total_members} membros
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-team-foreground">{stats.total_avaliacoes}</p>
                <p className="text-xs text-team-muted">vs {team_comparison.team_avg_avaliacoes} média</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-team-foreground">{stats.taxa_conversao}%</p>
                <p className="text-xs text-team-muted">vs {team_comparison.team_avg_conversao}% média</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts - Only for IMOBILIARIA plan */}
      {isImobiliaria && (
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          {/* Monthly Evolution */}
          <Card className="border-team-border bg-team-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
                <TrendingUp className="h-4 w-4 text-team-orange" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthly_evolution.length > 0 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly_evolution}>
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
                <div className="flex h-52 items-center justify-center">
                  <p className="text-sm text-team-muted">Sem dados de evolução</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-team-border bg-team-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
                <Award className="h-4 w-4 text-team-orange" />
                Tipos de Imóveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category_distribution.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-40 w-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={category_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="count"
                          nameKey="categoria"
                        >
                          {category_distribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {category_distribution.slice(0, 4).map((cat, i) => (
                      <div key={cat.categoria} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                          />
                          <span className="text-team-foreground">{cat.categoria}</span>
                        </div>
                        <span className="text-team-muted">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-team-muted">Sem dados de categorias</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Geographic Distribution - Only for IMOBILIARIA */}
      {isImobiliaria && geographic_distribution.length > 0 && (
        <Card className="mb-6 border-team-border bg-team-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
              <MapPin className="h-4 w-4 text-team-orange" />
              Regiões de Atuação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {geographic_distribution.map((geo, i) => (
                <div key={`${geo.cidade}-${geo.estado}`} className="flex items-center gap-3 rounded-lg border border-team-border bg-team-accent/20 p-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm text-white"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {geo.count}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-team-foreground">{geo.cidade}</p>
                    <p className="text-xs text-team-muted">{geo.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Evaluations */}
      <Card className="border-team-border bg-team-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-team-foreground">
            <Clock className="h-4 w-4 text-team-orange" />
            Avaliações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent_evaluations.length > 0 ? (
            <div className="space-y-3">
              {recent_evaluations.map((evaluation) => {
                const input = evaluation.input as Record<string, unknown>;
                const resultado = evaluation.resultado as Record<string, unknown>;
                
                return (
                  <Link
                    key={evaluation.id}
                    to={`/avaliacao/${evaluation.id}`}
                    className="flex items-center gap-4 rounded-lg border border-team-border bg-team-accent/20 p-3 transition-all hover:bg-team-accent/40"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      evaluation.convertido ? 'bg-green-500/20' : 'bg-team-muted/20'
                    }`}>
                      {evaluation.convertido ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-team-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-team-foreground truncate">
                        {String(input?.categoria || 'Imóvel')} - {String(input?.bairro || '')}
                      </p>
                      <p className="text-xs text-team-muted">
                        {String(input?.municipio || '')}, {String(input?.estado || '')} • {format(new Date(evaluation.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-team-orange">
                        {formatCurrency(Number(resultado?.valor_estimado) || 0)}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] ${evaluation.convertido ? 'bg-green-500/20 text-green-500' : 'bg-team-muted/20 text-team-muted'}`}
                      >
                        {evaluation.convertido ? 'Convertido' : 'Pendente'}
                      </Badge>
                    </div>
                    <ExternalLink className="h-4 w-4 text-team-muted shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-team-muted">Nenhuma avaliação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TeamDashboardLayout>
  );
}
