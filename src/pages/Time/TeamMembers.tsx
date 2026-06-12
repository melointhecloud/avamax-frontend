import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTenantPrefix } from '@/hooks/useTenantPrefix';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Mail, Clock, X, Send, UserPlus, RotateCw, Wallet, UserMinus, BarChart3, Target, Search, Check, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase-edge';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamSubscription } from '@/hooks/useTeamSubscription';
import { useTeamCreditPool } from '@/hooks/useTeamCreditPool';
import { useTeamGoals } from '@/hooks/useTeamGoals';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberCreditBadge } from '@/components/team/MemberCreditBadge';
import { CreditTransferHistory } from '@/components/team/CreditTransferHistory';
import { SetGoalDialog } from '@/components/team/SetGoalDialog';
import { RemaxJoinRequests } from '@/components/team/RemaxJoinRequests';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  user_id: string;
  role: string;
  created_at: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  is_owner: boolean;
  allocated_credits?: number;
}

interface TeamMemberWithGoal extends TeamMember {
  goal: number;
  current: number;
  progress: number;
}

interface TeamInvite {
  id: string;
  email: string;
  status: string;
  created_at: string;
  is_over_limit?: boolean;
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function TeamMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const prefix = useTenantPrefix();
  const { seatLimit, planName, isUnlimitedSeats } = useTeamSubscription();
  const isBrokerOrImobiliaria = planName === 'BROKER' || planName === 'IMOBILIARIA';
  // TODO(Phase 4): replace the hardcoded @remax.com.br domain check with tenant.domains lookup (COUPLING-ANALYSIS B8).
  const hasUnlimitedSeats = isUnlimitedSeats || (user?.email || '').toLowerCase().endsWith('@remax.com.br');
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [isTeamOwner, setIsTeamOwner] = useState(false);
  
  // Selection and search state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Goal dialog state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalDialogTarget, setGoalDialogTarget] = useState<{
    mode: 'single' | 'bulk';
    memberIds: string[];
    memberName?: string;
    currentGoal?: number;
  } | null>(null);
  
  const { data: creditPool, refetch: refetchCreditPool } = useTeamCreditPool(teamId);
  const { data: goalsData, upsertGoal, isUpdating } = useTeamGoals(teamId);

  // Merge members with goals data
  const membersWithGoals: TeamMemberWithGoal[] = useMemo(() => {
    return members.map(member => {
      const goalInfo = goalsData?.members.find(m => m.user_id === member.user_id);
      return {
        ...member,
        goal: goalInfo?.goal || 0,
        current: goalInfo?.current || 0,
        progress: goalInfo?.progress || 0,
      };
    });
  }, [members, goalsData]);

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersWithGoals;
    const query = searchQuery.toLowerCase();
    return membersWithGoals.filter(
      m => m.nome?.toLowerCase().includes(query) || m.email?.toLowerCase().includes(query)
    );
  }, [membersWithGoals, searchQuery]);

  // Check if all visible members are selected
  const allVisibleSelected = filteredMembers.length > 0 && 
    filteredMembers.every(m => selectedMembers.has(m.user_id));

  useEffect(() => {
    loadTeamData();
  }, [user]);

  async function loadTeamData() {
    if (!user) return;
    setLoading(true);

    try {
      // Get team where user is owner
      const { data: ownedTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let currentTeamId = ownedTeam?.id;
      let userIsOwner = !!ownedTeam;

      // If not owner, check if member
      if (!currentTeamId) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        currentTeamId = memberData?.team_id;
      }

      if (!currentTeamId) {
        setLoading(false);
        return;
      }

      // Update state with found teamId and owner status
      setTeamId(currentTeamId);
      setIsTeamOwner(userIsOwner);

      // Load members using RPC function
      const { data: membersData } = await supabase
        .rpc('get_team_members_with_profiles', { p_team_id: currentTeamId });

      if (membersData) {
        setMembers(membersData as TeamMember[]);
      }

      // Load pending invites
      const { data: invitesData } = await supabase
        .from('team_invites')
        .select('id, email, status, created_at, is_over_limit')
        .eq('team_id', currentTeamId)
        .eq('status', 'PENDING');

      setInvites(invitesData || []);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail || !teamId) return;

    setSending(true);
    try {
      const { data, error } = await invokeEdgeFunction<{ alreadyPending?: boolean }>('invite-team-member', {
        body: { teamId, email: inviteEmail, sourcePath: pathname },
      });

      if (error) return;

      if ((data as any)?.alreadyPending) {
        toast.info(`Já existe um convite pendente para ${inviteEmail}`);
      } else {
        toast.success(`Convite enviado para ${inviteEmail}`);
      }

      setInviteEmail('');
      await loadTeamData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setSending(false);
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    try {
      await supabase
        .from('team_invites')
        .update({ status: 'REVOKED' })
        .eq('id', inviteId);

      toast.success('Convite revogado');
      loadTeamData();
    } catch (error) {
      toast.error('Erro ao revogar convite');
    }
  }

  async function handleResendInvite(inviteId: string, email: string) {
    setResendingId(inviteId);
    try {
      const { data, error } = await invokeEdgeFunction('invite-team-member', {
        body: { resend: true, inviteId, sourcePath: pathname },
      });

      if (error) return;

      toast.success(`Convite reenviado para ${email}`);
      await loadTeamData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar convite');
    } finally {
      setResendingId(null);
    }
  }

  const handleCreditTransferSuccess = () => {
    loadTeamData();
    refetchCreditPool();
    setHistoryRefreshKey((prev) => prev + 1);
  };

  async function handleRemoveMember(memberId: string, memberName: string) {
    if (!teamId) return;
    
    setRemovingMemberId(memberId);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', memberId);

      if (error) throw error;

      toast.success(`${memberName} foi removido do time`);
      loadTeamData();
      refetchCreditPool();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover membro');
    } finally {
      setRemovingMemberId(null);
    }
  }

  // Selection handlers
  function toggleMemberSelection(userId: string) {
    setSelectedMembers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      // Deselect all visible
      setSelectedMembers(prev => {
        const next = new Set(prev);
        filteredMembers.forEach(m => next.delete(m.user_id));
        return next;
      });
    } else {
      // Select all visible
      setSelectedMembers(prev => {
        const next = new Set(prev);
        filteredMembers.forEach(m => next.add(m.user_id));
        return next;
      });
    }
  }

  // Goal dialog handlers
  function openGoalDialogForMember(member: TeamMemberWithGoal) {
    setGoalDialogTarget({
      mode: 'single',
      memberIds: [member.user_id],
      memberName: member.nome || 'Membro',
      currentGoal: member.goal,
    });
    setGoalDialogOpen(true);
  }

  function openGoalDialogForSelected() {
    const memberIds = Array.from(selectedMembers);
    if (memberIds.length === 0) return;

    if (memberIds.length === 1) {
      const member = membersWithGoals.find(m => m.user_id === memberIds[0]);
      if (member) {
        setGoalDialogTarget({
          mode: 'single',
          memberIds,
          memberName: member.nome || 'Membro',
          currentGoal: member.goal,
        });
      }
    } else {
      setGoalDialogTarget({
        mode: 'bulk',
        memberIds,
      });
    }
    setGoalDialogOpen(true);
  }

  async function handleSaveGoal(goal: number) {
    if (!goalDialogTarget) return;

    const memberIds = goalDialogTarget.memberIds;
    
    // Save for each selected member
    for (const memberId of memberIds) {
      upsertGoal({ userId: memberId, goal });
    }

    // Clear selection and close dialog
    setSelectedMembers(new Set());
    setGoalDialogOpen(false);
    setGoalDialogTarget(null);
  }

  async function handleSaveIndividualGoals(goals: { userId: string; goal: number }[]) {
    for (const { userId, goal } of goals) {
      upsertGoal({ userId, goal });
    }

    // Clear selection and close dialog
    setSelectedMembers(new Set());
    setGoalDialogOpen(false);
    setGoalDialogTarget(null);
  }

  const usedSeats = members.length + invites.length;

  // Get selected members info for dialog
  const selectedMembersInfo = goalDialogTarget?.memberIds.map(id => {
    const member = membersWithGoals.find(m => m.user_id === id);
    return {
      id,
      name: member?.nome || 'Membro',
      avatarUrl: member?.avatar_url || undefined,
      currentGoal: member?.goal,
    };
  }) || [];

  // Dialog description based on mode
  const goalDialogDescription = goalDialogTarget?.mode === 'bulk'
    ? `${goalDialogTarget.memberIds.length} membros selecionados`
    : goalDialogTarget?.memberName || '';

  return (
    <TeamDashboardLayout title="Membros do Time" subtitle="Gerencie sua equipe e convites">
      {/* Seats Usage */}
      <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-team-primary/10 p-2 shrink-0">
              <Users className="h-5 w-5 text-team-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-team-foreground">Assentos utilizados</p>
              <p className="text-xs text-team-muted">
                {hasUnlimitedSeats ? 'Ilimitado para corretores RE/MAX' : `${usedSeats} de ${seatLimit} disponíveis`}
              </p>
            </div>
          </div>
          {!hasUnlimitedSeats && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-2 w-24 sm:w-32 overflow-hidden rounded-full bg-team-accent">
                <div
                  className="h-full bg-team-primary transition-all"
                  style={{ width: `${(usedSeats / seatLimit) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-team-foreground">
                {Math.round((usedSeats / seatLimit) * 100)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Pool Card - Only for team owners */}
      {isTeamOwner && creditPool && (
        <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-team-orange/10 p-2 shrink-0">
                <Wallet className="h-5 w-5 text-team-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-team-foreground">Pool de Créditos</p>
                <p className="text-xs text-team-muted">
                  Distribuído: {creditPool.distributed_credits} de {creditPool.monthly_credits}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-team-orange">{creditPool.available_pool}</p>
                <p className="text-xs text-team-muted">Disponíveis</p>
              </div>
              <div className="h-8 w-px bg-team-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-team-foreground">{creditPool.remaining_credits}</p>
                <p className="text-xs text-team-muted">Restantes mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RE/MAX Join Requests - Only for team owners */}
      {isTeamOwner && (
        <RemaxJoinRequests teamId={teamId} onApproved={loadTeamData} />
      )}

      {/* Invite Section */}
      <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-team-foreground text-base sm:text-lg">
            <UserPlus className="h-5 w-5 shrink-0" />
            Convidar Corretor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted min-w-0"
            />
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail || sending || (!hasUnlimitedSeats && usedSeats >= seatLimit)}
              className="bg-team-orange text-white hover:bg-team-orange/90 shrink-0"
            >
              {sending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
          {!hasUnlimitedSeats && usedSeats >= seatLimit && (
            <p className="mt-2 text-sm text-red-400">
              Limite de assentos atingido. Faça upgrade para adicionar mais membros.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search and Select All Toolbar - Only for team owners */}
      {isTeamOwner && (
        <Card className="mb-6 border-team-border bg-team-card overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
                className="border-team-border data-[state=checked]:bg-team-orange data-[state=checked]:border-team-orange"
              />
              <span className="text-sm text-team-foreground">Selecionar todos</span>
            </div>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-team-muted" />
              <Input
                placeholder="Buscar membro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Bar - appears when members are selected */}
      {isTeamOwner && selectedMembers.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-3 rounded-full border border-team-border bg-team-card px-4 py-3 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-team-orange text-white text-sm font-medium">
                {selectedMembers.size}
              </div>
              <span className="text-sm text-team-foreground hidden sm:inline">
                {selectedMembers.size === 1 ? 'membro selecionado' : 'membros selecionados'}
              </span>
            </div>
            
            <div className="h-5 w-px bg-team-border" />
            
            <Button
              onClick={openGoalDialogForSelected}
              size="sm"
              className="bg-team-orange text-white hover:bg-team-orange/90 rounded-full"
            >
              <Target className="mr-2 h-4 w-4" />
              Definir Meta
            </Button>
            
            <Button
              onClick={() => setSelectedMembers(new Set())}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-team-muted hover:bg-team-accent hover:text-team-foreground"
              title="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 overflow-hidden">
        {/* Members List */}
        <Card className="border-team-border bg-team-card overflow-hidden min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-team-foreground text-base sm:text-lg">Membros Ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 bg-team-accent" />
              ))
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-team-muted">
                {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro no time'}
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="group flex flex-col gap-3 rounded-xl border border-team-border bg-gradient-to-br from-team-accent/30 to-team-accent/10 p-3 sm:p-4 transition-all hover:border-team-orange/30 hover:shadow-md"
                >
                  {/* Top row: Avatar, name, checkbox, actions */}
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox - only for owner */}
                    {isTeamOwner && (
                      <Checkbox
                        checked={selectedMembers.has(member.user_id)}
                        onCheckedChange={() => toggleMemberSelection(member.user_id)}
                        className="mt-1 border-team-border data-[state=checked]:bg-team-orange data-[state=checked]:border-team-orange shrink-0"
                      />
                    )}
                    
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 ring-2 ring-team-border">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-team-primary text-team-primary-foreground text-sm sm:text-base font-medium">
                        {member.nome?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-team-foreground text-sm sm:text-base">
                          {member.nome || 'Usuário'}
                        </p>
                        {member.progress >= 100 && member.goal > 0 && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/20">
                            <Check className="h-3 w-3 text-green-500" />
                          </div>
                        )}
                      </div>
                      <p className="truncate text-xs sm:text-sm text-team-muted">{member?.email || ''}</p>
                      
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge
                          variant={member.is_owner ? 'default' : 'secondary'}
                          className={`text-[10px] px-2 py-0.5 ${
                            member.is_owner
                              ? 'bg-team-orange/20 text-team-orange border border-team-orange/30'
                              : 'bg-team-accent text-team-muted border border-team-border'
                          }`}
                        >
                          {member.is_owner ? 'Admin' : 'Corretor'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions dropdown menu - for owner */}
                    {isTeamOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-team-muted hover:bg-team-accent hover:text-team-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="w-48 border-team-border bg-team-card"
                        >
                          <DropdownMenuItem
                            onClick={() => openGoalDialogForMember(member)}
                            className="cursor-pointer text-team-foreground focus:bg-team-accent focus:text-team-foreground"
                          >
                            <Target className="mr-2 h-4 w-4 text-team-orange" />
                            Definir meta
                          </DropdownMenuItem>
                          
                          {isBrokerOrImobiliaria && (
                            <DropdownMenuItem
                              onClick={() => navigate(prefix(`/time/member/${member.user_id}`))}
                              className="cursor-pointer text-team-foreground focus:bg-team-accent focus:text-team-foreground"
                            >
                              <BarChart3 className="mr-2 h-4 w-4 text-team-primary" />
                              Ver métricas
                            </DropdownMenuItem>
                          )}
                          
                          {!member.is_owner && (
                            <>
                              <DropdownMenuSeparator className="bg-team-border" />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remover do time
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="remax-theme border-team-border bg-team-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-team-foreground">
                                      Remover {member.nome || 'membro'}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-team-muted">
                                      Esta ação irá remover {member.nome || 'este membro'} do time. 
                                      Os créditos alocados ({member.allocated_credits || 0}) serão devolvidos ao pool.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-team-border bg-team-accent text-team-foreground hover:bg-team-accent/80">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.user_id, member.nome || 'Membro')}
                                      className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {/* Bottom row: Credits and Progress */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-team-border/50">
                    {/* Credits section */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-team-orange/10">
                        <Wallet className="h-3.5 w-3.5 text-team-orange" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-team-foreground">
                          {member.allocated_credits || 0}
                        </span>
                        <span className="text-xs text-team-muted">créditos</span>
                      </div>
                      {isTeamOwner && !member.is_owner && (
                        <MemberCreditBadge
                          allocatedCredits={member.allocated_credits || 0}
                          isOwner={member.is_owner}
                          canManage={true}
                          availablePool={creditPool?.available_pool || 0}
                          memberId={member.user_id}
                          memberName={member.nome || 'Membro'}
                          teamId={teamId || ''}
                          onSuccess={handleCreditTransferSuccess}
                          showBadge={false}
                        />
                      )}
                    </div>
                    
                    {/* Divider */}
                    <div className="hidden sm:block h-4 w-px bg-team-border" />
                    
                    {/* Goal progress section - only for owner */}
                    {isTeamOwner && (
                      <div className="flex flex-1 items-center gap-2 min-w-[120px]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-team-primary/10">
                          <Target className="h-3.5 w-3.5 text-team-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs text-team-muted">Meta mensal</span>
                            <span className="text-xs font-medium text-team-foreground">
                              {member.goal > 0 ? `${member.current}/${member.goal}` : 'Sem meta'}
                            </span>
                          </div>
                          <Progress
                            value={member.goal > 0 ? Math.min(member.progress, 100) : 0}
                            className={cn(
                              'h-1.5 bg-team-accent',
                              member.goal > 0 && `[&>div]:${getProgressColor(member.progress)}`
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Invites */}
        <Card className="border-team-border bg-team-card overflow-hidden min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-team-foreground text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              Convites Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 bg-team-accent" />
              ))
            ) : invites.length === 0 ? (
              <p className="text-center text-sm text-team-muted">Nenhum convite pendente</p>
            ) : (
              invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-2 sm:gap-3 rounded-lg border border-team-border bg-team-accent/20 p-2 sm:p-3"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!hasUnlimitedSeats && invite.is_over_limit ? 'bg-yellow-500/10' : 'bg-team-primary/10'}`}>
                    <Mail className={`h-4 w-4 ${!hasUnlimitedSeats && invite.is_over_limit ? 'text-yellow-500' : 'text-team-primary'}`} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate font-medium text-team-foreground text-sm">{invite.email}</p>
                    <p className="truncate text-xs text-team-muted">
                      {!hasUnlimitedSeats && invite.is_over_limit ? (
                        <span className="text-yellow-500">Aguardando vaga</span>
                      ) : (
                        `Enviado em ${new Date(invite.created_at).toLocaleDateString('pt-BR')}`
                      )}
                    </p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResendInvite(invite.id, invite.email)}
                      disabled={resendingId === invite.id}
                      className="h-7 w-7 text-team-primary hover:bg-team-primary/10 hover:text-team-primary"
                      title="Reenviar convite"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${resendingId === invite.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="h-7 w-7 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      title="Revogar convite"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit Transfer History - Only for team owners */}
      {isTeamOwner && (
        <div className="mt-6">
          <CreditTransferHistory teamId={teamId} refreshKey={historyRefreshKey} />
        </div>
      )}

      {/* Goal Dialog */}
      <SetGoalDialog
        open={goalDialogOpen}
        onOpenChange={(open) => {
          setGoalDialogOpen(open);
          if (!open) setGoalDialogTarget(null);
        }}
        memberName={goalDialogDescription}
        currentGoal={goalDialogTarget?.mode === 'single' ? goalDialogTarget.currentGoal : undefined}
        onSave={handleSaveGoal}
        onSaveIndividual={handleSaveIndividualGoals}
        isLoading={isUpdating}
        isBulk={goalDialogTarget?.mode === 'bulk'}
        members={selectedMembersInfo}
      />

    </TeamDashboardLayout>
  );
}
