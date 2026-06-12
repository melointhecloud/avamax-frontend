import { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, Home, Users, Settings, ArrowLeft, Building2, Sparkles, LogOut, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTeamLayoutData, getRoleLabel } from '@/hooks/useTeamLayoutData';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const teamMenuItems = [
  { icon: Home, label: 'Dashboard', path: '/time/home' },
  { icon: Building2, label: 'Avaliações', path: '/time/credits' },
  { icon: Users, label: 'Membros', path: '/time/members' },
  { icon: Settings, label: 'Configurações', path: '/time/settings' },
];

interface TeamHeaderProps {
  title?: string;
}

export function TeamHeader({ title }: TeamHeaderProps) {
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { data: teamData, isLoading } = useTeamLayoutData();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/signin');
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const userRoleLabel = teamData?.userRole ? getRoleLabel(teamData.userRole) : 'Membro';
  const location = useLocation();
  const isRemax = true;
  const settingsPath = isRemax ? '/configuracoes' : '/configuracoes';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-team-border bg-team-sidebar/95 px-4 backdrop-blur-xl lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-team-muted hover:text-team-foreground"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title */}
        <h1 className="text-xl font-semibold text-team-foreground hidden sm:block">
          {title || 'Home'}
        </h1>

        <div className="flex-1" />

        {/* Right Side - User Info */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-team-muted hover:text-team-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-team-foreground">
                    {profile?.nome || 'Usuário'}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-3 w-16 bg-team-muted/20 ml-auto" />
                  ) : (
                    <p className="text-xs text-team-muted">{userRoleLabel}</p>
                  )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-team-primary text-sm font-medium text-team-primary-foreground overflow-hidden ring-2 ring-team-border">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile?.nome, profile?.email)
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-team-muted hidden sm:block" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "w-72 p-0 border-team-border bg-team-sidebar z-50 text-team-foreground",
                isRemax && "remax-theme"
              )}
              align="end"
              sideOffset={8}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-team-primary text-lg font-semibold text-team-primary-foreground overflow-hidden ring-2 ring-team-border">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile?.nome, profile?.email)
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-semibold text-team-foreground">
                    {profile?.nome || 'Usuário'}
                  </p>
                  <p className="truncate text-sm text-team-muted">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <Separator className="bg-team-border" />

              {/* Info */}
              <div className="p-3 space-y-2">
                {profile?.creci && (
                  <div className="flex items-center gap-2 text-sm text-team-muted">
                    <BadgeCheck className="h-4 w-4 text-team-primary" />
                    <span>CRECI: {profile.creci}</span>
                  </div>
                )}
                {teamData?.teamName && (
                  <div className="flex items-center gap-2 text-sm text-team-muted">
                    <Building2 className="h-4 w-4 text-team-primary" />
                    <span className="truncate">{teamData.teamName}</span>
                  </div>
                )}
                {!profile?.creci && !teamData?.teamName && (
                  <p className="text-sm italic text-team-muted">
                    Complete seu perfil nas configurações
                  </p>
                )}
              </div>

              <Separator className="bg-team-border" />

              {/* Actions */}
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium text-team-foreground hover:text-team-primary hover:bg-team-accent/50"
                  onClick={() => navigate(settingsPath)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Ver perfil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className={cn("w-72 border-team-border bg-team-sidebar p-0", isRemax && "remax-theme")}>
          <SheetHeader className="sr-only">
            <SheetTitle>Menu do Time</SheetTitle>
          </SheetHeader>

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

          {/* Nova Avaliação Button */}
          <div className="px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/avaliar');
                setMobileOpen(false);
              }}
              className="w-full justify-start gap-2 bg-team-orange text-white hover:bg-team-orange/90 font-medium"
            >
              <Sparkles className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-team-muted">
              Visão Geral
            </p>
            <nav className="space-y-1">
              {teamMenuItems.map(item => (
                <NavLink
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
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
                </NavLink>
              ))}
            </nav>

            {/* Members Section */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-team-muted">
                    Membros
                  </p>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-team-accent text-[10px] text-team-muted">
                    {isLoading ? '-' : teamData?.totalMembers || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Skeleton className="h-8 w-8 rounded-full bg-team-muted/20" />
                      <Skeleton className="h-4 w-24 bg-team-muted/20" />
                    </div>
                  </>
                ) : teamData?.members?.slice(0, 4).map(member => (
                  <button
                    key={member.user_id}
                    onClick={() => {
                      navigate('/time/members');
                      setMobileOpen(false);
                    }}
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
              </div>
            </div>
          </div>

          {/* Back to App */}
          <div className="border-t border-team-border p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/home');
                setMobileOpen(false);
              }}
              className="w-full justify-start gap-2 text-team-muted hover:bg-team-accent hover:text-team-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao App
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
