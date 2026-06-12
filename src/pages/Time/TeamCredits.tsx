import { useState, useEffect } from 'react';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingDown, Users, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MemberUsage {
  name: string;
  used: number;
}

interface CreditHistoryItem {
  id: number;
  user_name: string;
  action: string;
  credits: number;
  date: string;
}

interface TeamCreditsData {
  monthly_credits: number;
  credit_balance: number;
  credit_limit: number;
  plan: string;
  credits_used_this_month: number;
  days_until_recharge: number;
  next_recharge_date: string;
  member_usage: MemberUsage[];
  credit_history: CreditHistoryItem[];
}

export default function TeamCredits() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamCreditsData | null>(null);

  useEffect(() => {
    loadCreditsData();
  }, [user]);

  async function loadCreditsData() {
    if (!user) return;
    setLoading(true);

    try {
      // Get team ID
      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let teamId = teamData?.id;

      if (!teamId) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        teamId = memberData?.team_id;
      }

      if (teamId) {
        const { data: creditsData, error } = await supabase
          .rpc('get_team_credits_data', { p_team_id: teamId });

        if (error) throw error;
        setData(creditsData as unknown as TeamCreditsData);
      }
    } catch (error) {
      console.error('Error loading credits data:', error);
    } finally {
      setLoading(false);
    }
  }

  const creditsRemaining = data?.monthly_credits 
    ? (data?.monthly_credits || 0) - (data?.credits_used_this_month || 0)
    : 0;
  const creditLimit = data?.credit_limit || 0;
  const creditBalance = data?.credit_balance || 0;
  const percentRemaining = creditLimit 
    ? Math.round((creditBalance / creditLimit) * 100) 
    : 0;

  return (
    <TeamDashboardLayout title="Créditos do Time" subtitle="Acompanhe o consumo de créditos da equipe">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-team-border bg-team-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-team-muted">
              Créditos Totais
            </CardTitle>
            <CreditCard className="h-4 w-4 text-team-orange" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-team-accent" />
            ) : (
              <>
                <div className="text-2xl font-bold text-team-foreground">
                  {creditBalance?.toLocaleString('pt-BR') || '0'}
                </div>
                <p className="text-xs text-team-muted">
                  Limite: {creditLimit?.toLocaleString('pt-BR') || '0'} · Plano {data?.plan || '-'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-team-muted">
              Créditos Usados
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-team-accent" />
            ) : (
              <>
                <div className="text-2xl font-bold text-team-foreground">
                  {data?.credits_used_this_month || 0}
                </div>
                <p className="text-xs text-team-muted">Este mês</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-team-muted">
              Créditos Restantes
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-team-accent" />
            ) : (
              <>
                <div className="text-2xl font-bold text-team-foreground">
                  {creditBalance}
                </div>
                <p className="text-xs text-team-muted">{percentRemaining}% do limite</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-team-border bg-team-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-team-muted">
              Próxima Recarga
            </CardTitle>
            <Calendar className="h-4 w-4 text-team-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-team-accent" />
            ) : (
              <>
                <div className="text-2xl font-bold text-team-foreground">
                  {data?.days_until_recharge || 0} dias
                </div>
                <p className="text-xs text-team-muted">{data?.next_recharge_date || '-'}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Usage by Member */}
        <Card className="border-team-border bg-team-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-team-foreground">
              <Users className="h-5 w-5" />
              Consumo por Membro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-team-accent" />
              ))
            ) : data?.member_usage?.length === 0 ? (
              <p className="text-center text-sm text-team-muted">Nenhum consumo este mês</p>
            ) : (
              data?.member_usage?.map((member, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-team-foreground">
                      {member.name}
                    </span>
                    <span className="text-sm text-team-muted">
                      {member.used} créditos
                    </span>
                  </div>
                  <Progress
                    value={data?.monthly_credits ? (member.used / data.monthly_credits) * 100 : 0}
                    className="h-2 bg-team-accent"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Credit History */}
        <Card className="border-team-border bg-team-card">
          <CardHeader>
            <CardTitle className="text-team-foreground">Histórico de Créditos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-team-accent" />
                ))
              ) : data?.credit_history?.length === 0 ? (
                <p className="text-center text-sm text-team-muted">Nenhum histórico</p>
              ) : (
                data?.credit_history?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-team-border bg-team-accent/20 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-team-foreground">{item.user_name}</p>
                      <p className="text-xs text-team-muted">{item.action}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          item.credits > 0 ? 'text-green-500' : 'text-red-400'
                        }`}
                      >
                        {item.credits > 0 ? '+' : ''}
                        {item.credits}
                      </p>
                      <p className="text-xs text-team-muted">
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamDashboardLayout>
  );
}