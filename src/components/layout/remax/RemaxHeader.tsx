import { useState } from 'react';
import { Menu, Bell, ChevronDown, Home, Globe, Search, ShoppingBag, FileText, CreditCard, Trophy, Newspaper, GraduationCap, Download, Users, Settings, ArrowLeft, Sparkles, LogOut, BadgeCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
// Served from public/ (not statically bundled) — Phase 3 branding isolation.
const avamaxLogo = '/assets/avamax-brand.png';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useUserCredits } from '@/hooks/useUserCredits';

const remaxMenuItems = [
  { icon: Home, label: 'Início', path: '/home' },
  { icon: Globe, label: 'Rede Avaluz', path: '/rede' },
  { icon: Search, label: 'Avaliar Imóvel', path: '/avaliar' },
  { icon: ShoppingBag, label: 'Buscar Imóveis', path: '/buscar-imoveis' },
  { icon: FileText, label: 'Histórico', path: '/historico' },
  
  { icon: Trophy, label: 'Conquistas', path: '/conquistas' },
  { icon: Newspaper, label: 'Noticiário', path: '/noticiario' },
  { icon: GraduationCap, label: 'Tutorial AvaLuz', path: '/tutorial-avaluz' },
  { icon: Download, label: 'Instale o App', path: '/tutorial' },
];

interface RemaxHeaderProps {
  title?: string;
}

export function RemaxHeader({ title }: RemaxHeaderProps) {
  const { profile } = useAuth();
  const { data: creditsData } = useUserCredits();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/signin');
  };
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 backdrop-blur-xl lg:px-6 border-b border-border bg-card/95">
        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title */}
        <h1 className="text-xl font-semibold hidden sm:block text-foreground">
          {title || 'Dashboard'}
        </h1>

        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative transition-colors text-muted-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.nome || 'Corretor'}
                  </p>
                  <p className="text-xs text-primary">AvaMax</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white overflow-hidden ring-2 ring-red-200"
                  style={{ background: 'hsl(0 100% 40%)' }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile?.nome, profile?.email)
                  )}
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 bg-popover z-50 remax-theme" align="end" sideOffset={8}>
              {/* Header */}
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white overflow-hidden ring-2 ring-border"
                  style={{ background: 'hsl(0 100% 40%)' }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile?.nome, profile?.email)
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-semibold text-foreground">
                    {profile?.nome || 'Corretor'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Info */}
              <div className="p-3 space-y-2">
                {profile?.creci && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span>CRECI: {profile.creci}</span>
                  </div>
                )}
                {profile?.imobiliaria && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="truncate">{profile.imobiliaria}</span>
                  </div>
                )}
                {!profile?.creci && !profile?.imobiliaria && (
                  <p className="text-sm italic text-muted-foreground">
                    Complete seu perfil nas configurações
                  </p>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground font-medium hover:text-primary-foreground hover:bg-primary"
                  onClick={() => navigate('/creditos')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Financeiro
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground font-medium hover:text-primary-foreground hover:bg-primary"
                  onClick={() => navigate('/configuracoes')}
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
        <SheetContent side="left" className="flex w-72 flex-col p-0 bg-sidebar border-border remax-theme">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu AvaMax</SheetTitle>
          </SheetHeader>

          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-6 border-b border-border">
            <img src={avamaxLogo} alt="AvaMax" className="h-14 w-auto" />
          </div>

          {/* CTA */}
          <div className="px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => { navigate('/avaliar'); setMobileOpen(false); }}
              className="w-full justify-start gap-2 text-primary-foreground font-medium transition-colors bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 min-h-0">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </p>
            <nav className="space-y-0.5">
              {remaxMenuItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              {creditsData?.is_owner && creditsData?.team_id && (
                <NavLink
                  to="/time/home"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  <Users className="h-4 w-4" />
                  Meu Time
                </NavLink>
              )}
            </nav>
          </div>

          {/* Back */}
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { navigate('/home'); setMobileOpen(false); }}
              className="w-full justify-start gap-2 transition-colors text-muted-foreground"
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
