import { useEffect, useState } from 'react';
import { Home, Building2, Trophy, Map, Search, Newspaper, CalendarDays, Settings, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
// Served from public/ (not statically bundled) — Phase 3 branding isolation.
const avamaxLogo = '/assets/avamax-brand.png';

const mfrMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/mfr/home' },
    { icon: Building2, label: 'Imobiliárias', path: '/mfr/imobiliarias' },
    { icon: Trophy, label: 'Rankings', path: '/mfr/rankings' },
    { icon: Map, label: 'Mapa de Calor', path: '/mfr/mapa' },
    { icon: Search, label: 'Avaliar Imóvel', path: '/mfr/avaliar' },
    { icon: CalendarDays, label: 'Agenda', path: '/mfr/agenda' },
    { icon: Newspaper, label: 'Noticiário', path: '/mfr/noticiario' },
    { icon: Settings, label: 'Configurações', path: '/mfr/configuracoes' },
];

interface MfrMobileSidebarProps {
    onClose: () => void;
}

export function MfrMobileSidebar({ onClose }: MfrMobileSidebarProps) {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [mfrName, setMfrName] = useState<string>('');

    useEffect(() => {
        if (!profile?.mfr_id) return;
        supabase
            .from('remax_mfrs')
            .select('name')
            .eq('id', profile.mfr_id)
            .single()
            .then(({ data }) => {
                if (data?.name) setMfrName(data.name);
            });
    }, [profile?.mfr_id]);

    return (
        <div className="flex h-full flex-col bg-sidebar">
            {/* Logo */}
            <div className="flex items-center justify-center px-4 py-6 border-b border-border">
                <img src={avamaxLogo} alt="AvaMax" className="h-12 w-auto" />
            </div>

            {/* MFR Badge */}
            {mfrName && (
                <div className="px-4 py-3 border-b border-border">
                    <div className="rounded-lg px-3 py-2 bg-primary/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                            Master Franquiado
                        </p>
                        <p className="text-sm font-bold truncate text-foreground">
                            {mfrName}
                        </p>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <nav className="space-y-0.5">
                    {mfrMenuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'text-primary bg-primary/5'
                                        : 'text-sidebar-foreground hover:bg-accent'
                                }`
                            }
                        >
                            {({ isActive }: { isActive: boolean }) => (
                                <>
                                    {isActive && (
                                        <span
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
                                            style={{
                                                boxShadow: '0 0 8px hsl(var(--primary) / 0.4)',
                                            }}
                                        />
                                    )}
                                    <item.icon
                                        className="h-4 w-4 transition-all duration-200"
                                        strokeWidth={1.5}
                                    />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigate('/home'); onClose(); }}
                    className="neu-press w-full justify-start gap-2 rounded-lg text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar ao App
                </Button>
            </div>
        </div>
    );
}
