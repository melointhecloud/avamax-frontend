import { Home, Users, CreditCard, Settings, ArrowLeft, Building2, ChevronLeft, ChevronRight, Sparkles, History, BarChart3, GraduationCap, Trophy, CalendarDays, FileDown } from 'lucide-react';
// Served from public/ (not statically bundled) — Phase 3 branding isolation.
const avamaxLogo = '/assets/avamax-brand.png';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTeamLayoutData, getRoleLabel } from '@/hooks/useTeamLayoutData';
import { useTeamSubscription } from '@/hooks/useTeamSubscription';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const getTeamMenuItems = (isImobiliaria: boolean) => [
  { icon: Home, label: 'Dashboard', path: '/time/home' },
  { icon: CalendarDays, label: 'Agenda', path: '/time/agenda' },
  { icon: History, label: 'Histórico', path: '/time/history' },
  { icon: Building2, label: 'Financeiro', path: '/time/credits' },
  { icon: Users, label: 'Membros', path: '/time/members' },
  { icon: Trophy, label: 'Conquistas', path: '/time/conquistas' },
  ...(isImobiliaria ? [
    { icon: BarChart3, label: 'Analytics', path: '/time/analytics', badge: 'PRO' },
    { icon: FileDown, label: 'Relatório PDF', path: '/time/report', badge: 'PRO' },
  ] : []),
  { icon: GraduationCap, label: 'Treinamento', path: '/time/training', badge: 'NOVO' },
  { icon: Settings, label: 'Configurações', path: '/time/settings' },
];

export function TeamSidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Single-tenant AvaMax app: routes are served at root, so the prefix is identity.
  const prefix = (path: string) => path;
  const { data: teamData, isLoading } = useTeamLayoutData();
  const { planName } = useTeamSubscription();
  const isImobiliaria = planName === 'IMOBILIARIA';
  const teamMenuItems = getTeamMenuItems(isImobiliaria);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-team-border bg-team-sidebar lg:flex">
      {/* User Profile Section */}
      <div className="flex items-center gap-3 border-b border-team-border px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-team-primary text-sm font-bold text-team-primary-foreground overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            getInitials(profile?.nome, profile?.email)
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-team-foreground">
            {profile?.nome || 'Usuário'}
          </p>
          <p className="text-xs text-team-orange">
            {teamData?.teamName || profile?.imobiliaria || 'Minha Imobiliária'}
          </p>
        </div>
      </div>

      {/* Search/Project Button */}
      <div className="px-4 py-3">
        <Button
          variant="ghost"
          onClick={() => navigate(prefix('/avaliar'))}
          className="w-full justify-start gap-2 bg-team-orange text-white hover:bg-team-orange/90 font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      {/* Overview Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-team-muted">
          Visão Geral
        </p>
        <nav className="space-y-1">
          {teamMenuItems.map(item => (
            <NavLink
              key={item.path + item.label}
              to={prefix(item.path)}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-team-accent text-team-orange'
                    : 'text-team-muted hover:bg-team-accent/50 hover:text-team-foreground'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {'badge' in item && item.badge && (
                <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-team-orange/20 text-team-orange">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Team Members Section */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-team-muted">
                Corretores
              </p>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-team-accent text-[10px] text-team-muted">
                {isLoading ? '-' : teamData?.totalMembers || 0}
              </span>
            </div>
            <div className="flex gap-1">
              <button className="rounded p-0.5 text-team-muted hover:text-team-foreground">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button className="rounded p-0.5 text-team-muted hover:text-team-foreground">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-team-muted/20" />
                  <Skeleton className="h-4 w-24 bg-team-muted/20" />
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-team-muted/20" />
                  <Skeleton className="h-4 w-20 bg-team-muted/20" />
                </div>
              </>
            ) : teamData?.members?.slice(0, 4).map(member => (
              <button
                key={member.user_id}
                onClick={() => navigate(prefix(`/time/member/${member.user_id}`))}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-team-accent/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-team-orange/60 to-team-primary/60 text-xs font-medium text-white overflow-hidden">
                  {member?.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(member?.name, member?.email)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-sm text-team-foreground">
                    {member?.name || member?.email || 'Membro'}
                  </span>
                  <span className="block text-[10px] text-team-muted">
                    {getRoleLabel(member?.role)}
                  </span>
                </div>
              </button>
            ))}
            {!isLoading && (!teamData?.members || teamData.members.length === 0) && (
              <p className="px-3 py-2 text-xs text-team-muted">Nenhum membro</p>
            )}
          </div>
        </div>
      </div>

      {/* Promo Card */}
      <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-team-accent to-team-card p-4">
        <div className="mb-2 flex justify-center">
          <img src={avamaxLogo} alt="AvaMax" className="h-12 w-auto object-contain" />
        </div>
        <p className="text-center text-sm font-semibold text-team-foreground">
          Novos recursos
        </p>
        <p className="mt-1 text-center text-xs text-team-muted">
          Descubra as novidades
        </p>
      </div>

      {/* Back to Main App - Footer */}
      <div className="border-t border-team-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(prefix('/home'))}
          className="w-full justify-start gap-2 text-team-muted hover:bg-team-accent hover:text-team-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao App
        </Button>
      </div>
    </aside>
  );
}
