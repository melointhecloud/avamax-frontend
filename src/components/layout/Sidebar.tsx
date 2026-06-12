import { Home, Search, FileText, CreditCard, Download, Users, GraduationCap, Newspaper, Globe, ShoppingBag, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserPopover } from './UserPopover';
import { useUserCredits } from '@/hooks/useUserCredits';
import logo from '@/assets/avaluz-logo-transparent.png';

const baseMenuItems = [{
  icon: Home,
  label: 'Início',
  path: '/home'
}, {
  icon: Globe,
  label: 'Rede Avaluz',
  path: '/rede'
}, {
  icon: Search,
  label: 'Avaliar Imóvel',
  path: '/avaliar'
}, {
  icon: ShoppingBag,
  label: 'Buscar Imóveis',
  path: '/buscar-imoveis'
}, {
  icon: FileText,
  label: 'Histórico',
  path: '/historico'
}, {
  icon: CreditCard,
  label: 'Financeiro',
  path: '/creditos'
}, {
  icon: Trophy,
  label: 'Conquistas',
  path: '/conquistas'
}, {
  icon: Newspaper,
  label: 'Noticiário',
  path: '/noticiario'
}, {
  icon: GraduationCap,
  label: 'Tutorial AvaLuz',
  path: '/tutorial-avaluz'
}, {
  icon: Download,
  label: 'Instale o App',
  path: '/tutorial'
}];

const teamMenuItem = {
  icon: Users,
  label: 'Meu Time',
  path: '/time/home'
};

export const Sidebar = () => {
  const { profile } = useAuth();
  const { data: userCredits, isLoading: creditsLoading } = useUserCredits();

  // Build menu items conditionally - only show "Meu Time" for team owners
  const menuItems = [...baseMenuItems];
  if (!creditsLoading && userCredits?.is_owner) {
    // Insert "Meu Time" after "Financeiro" (index 6)
    menuItems.splice(6, 0, teamMenuItem);
  }

  const getInitials = () => {
    if (profile?.nome) {
      return profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  return <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4">
          <img alt="Avaluz" className="h-[8.75rem] w-auto" src={logo} />
        </div>

        {/* Navigation - Scrollable area for all menu items */}
        <nav className="flex-1 overflow-y-auto overscroll-contain space-y-1 px-3 py-4">
          {menuItems.map(item => <NavLink key={item.path} to={item.path} className={({
          isActive
        }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground')}>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>)}
        </nav>

        {/* User Block - Clicável com Popover */}
        {profile && (
          <div className="border-t border-sidebar-border p-4">
            <UserPopover>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/50">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground overflow-hidden')}>
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" /> : getInitials()}
                </div>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {profile.nome || profile.email || 'Usuário'}
                  </p>
                  {profile.creci && <p className="truncate text-xs text-sidebar-foreground/60">
                      CRECI: {profile.creci}
                    </p>}
                  {!profile.creci && <p className="text-xs text-sidebar-foreground/60">
                      {userCredits?.available ?? profile.credits ?? 0} créditos
                    </p>}
                </div>
              </button>
            </UserPopover>
          </div>
        )}
      </div>
    </aside>;
};