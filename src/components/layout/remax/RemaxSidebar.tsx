import { useState, useEffect } from 'react';
import { Home, Globe, Search, ShoppingBag, FileText, CreditCard, Users, Trophy, Newspaper, GraduationCap, Download, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUserCredits } from '@/hooks/useUserCredits';
// Served from public/ (not statically bundled) — Phase 3 branding isolation.
const avamaxLogo = '/assets/avamax-brand.png';

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

export function RemaxSidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: creditsData } = useUserCredits();
  const [franchiseName, setFranchiseName] = useState<string>('');

  useEffect(() => {
    if (!profile?.remax_franchise_id) return;
    supabase
      .from('remax_franchises')
      .select('name')
      .eq('id', profile.remax_franchise_id)
      .single()
      .then(({ data }) => {
        if (data?.name) setFranchiseName(data.name);
      });
  }, [profile?.remax_franchise_id]);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border lg:flex bg-sidebar">
      {/* Logo AvaMax */}
      <div className="flex items-center justify-center px-4 py-6 border-b border-border">
        <img src={avamaxLogo} alt="AvaMax" className="h-14 w-auto" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <nav className="space-y-0.5">
          {remaxMenuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
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
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
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

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          className="w-full justify-start gap-2 transition-colors text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao App
        </Button>
      </div>
    </aside>
  );
}
