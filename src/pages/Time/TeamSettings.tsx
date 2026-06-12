import { useState, useEffect } from 'react';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, CreditCard, ExternalLink, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase-edge';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamSubscription } from '@/hooks/useTeamSubscription';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Team {
  id: string;
  name: string;
  plan: string;
  monthly_credits: number;
  seat_limit: number;
  created_at: string;
}

export default function TeamSettings() {
  const { user } = useAuth();
  const { planName, seatLimit, monthlyCredits, isUnlimitedSeats } = useTeamSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    loadTeam();
  }, [user]);

  async function loadTeam() {
    if (!user) return;
    setLoading(true);

    try {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (data) {
        setTeam(data);
        setTeamName(data.name);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!team || !teamName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: teamName.trim() })
        .eq('id', team.id);

      if (error) throw error;

      toast.success('Configurações salvas');
      loadTeam();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleManageSubscription() {
    try {
      const { data, error } = await invokeEdgeFunction<{ url: string }>('customer-portal');

      if (error) return;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error('Erro ao acessar portal de assinatura');
    }
  }

  if (loading) {
    return (
      <TeamDashboardLayout title="Configurações" subtitle="Gerencie as configurações do time">
        <div className="space-y-6">
          <Skeleton className="h-48 bg-team-accent" />
          <Skeleton className="h-48 bg-team-accent" />
        </div>
      </TeamDashboardLayout>
    );
  }

  return (
    <TeamDashboardLayout title="Configurações" subtitle="Gerencie as configurações do time">
      <div className="space-y-6">
        {/* Team Info */}
        <Card className="border-team-border bg-team-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-team-foreground">
              <Building2 className="h-5 w-5" />
              Informações do Time
            </CardTitle>
            <CardDescription className="text-team-muted">
              Configure os dados básicos do seu time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-team-foreground">
                Nome do Time
              </Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="border-team-border bg-team-accent/30 text-team-foreground"
                placeholder="Ex: Imobiliária Exemplo"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || teamName === team?.name}
              className="bg-team-primary text-white hover:bg-team-primary/90"
            >
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="border-team-border bg-team-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-team-foreground">
              <CreditCard className="h-5 w-5" />
              Assinatura
            </CardTitle>
            <CardDescription className="text-team-muted">
              Detalhes do seu plano atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-team-border bg-team-accent/20 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-team-foreground">
                    Plano {planName}
                  </span>
                  <Badge className="bg-team-orange text-white">Ativo</Badge>
                </div>
                <p className="mt-1 text-sm text-team-muted">
                  {monthlyCredits} créditos/mês • {seatLimit} assentos
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-team-border bg-team-accent/10 p-4">
                <p className="text-sm text-team-muted">Créditos mensais</p>
                <p className="text-2xl font-bold text-team-foreground">
                  {monthlyCredits}
                </p>
              </div>
              <div className="rounded-lg border border-team-border bg-team-accent/10 p-4">
                <p className="text-sm text-team-muted">Limite de assentos</p>
                <p className="text-2xl font-bold text-team-foreground">{isUnlimitedSeats ? 'Ilimitado' : seatLimit}</p>
              </div>
            </div>

            <Button
              onClick={handleManageSubscription}
              variant="outline"
              className="w-full border-team-border text-team-foreground hover:bg-team-accent"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Gerenciar Assinatura no Stripe
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/30 bg-team-card">
          <CardHeader>
            <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
            <CardDescription className="text-team-muted">
              Ações irreversíveis para o time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => toast.info('Entre em contato com o suporte para cancelar o time')}
            >
              Cancelar Time
            </Button>
          </CardContent>
        </Card>
      </div>
    </TeamDashboardLayout>
  );
}
