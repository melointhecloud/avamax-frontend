import { Home, Network, Trophy, Map, Search, Newspaper, CalendarDays, Settings, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
// Served from public/ (not statically bundled) — Phase 3 branding isolation.
const avamaxLogo = '/assets/avamax-brand.png';

const ceoMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/ceo/home' },
    { icon: Network, label: 'Rede', path: '/ceo/rede' },
    { icon: Trophy, label: 'Rankings', path: '/ceo/rankings' },
    { icon: Map, label: 'Mapa de Calor', path: '/ceo/mapa' },
    { icon: CalendarDays, label: 'Agenda', path: '/ceo/agenda' },
    { icon: Newspaper, label: 'Noticiário', path: '/ceo/noticiario' },
    { icon: Settings, label: 'Configurações', path: '/ceo/configuracoes' },
];

interface CeoMobileSidebarProps {
    onClose: () => void;
}

export function CeoMobileSidebar({ onClose }: CeoMobileSidebarProps) {
    const { profile } = useAuth();
    const navigate = useNavigate();

    return (
        <div
            className="flex h-full flex-col"
            style={{ background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(216 20% 98%) 100%)' }}
        >
            {/* Logo */}
            <div className="flex items-center justify-center px-4 py-6 border-b" style={{ borderColor: 'hsl(216 20% 92%)' }}>
                <img src={avamaxLogo} alt="AvaMax" className="h-12 w-auto" />
            </div>

            {/* CEO Badge */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'hsl(216 20% 92%)' }}>
                <div className="rounded-lg px-3 py-2" style={{ background: 'hsl(216 100% 96%)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(216 100% 40%)' }}>
                        CEO
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: 'hsl(216 30% 25%)' }}>
                        {profile?.nome || 'CEO Avaluz'}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <nav className="space-y-0.5">
                    {ceoMenuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                            style={({ isActive }) => ({
                                color: isActive ? 'hsl(43 90% 42%)' : 'hsl(216 20% 40%)',
                                background: isActive ? 'hsl(43 90% 55% / 0.06)' : undefined,
                            })}
                        >
                            {({ isActive }: { isActive: boolean }) => (
                                <>
                                    {isActive && (
                                        <span
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                            style={{
                                                background: 'linear-gradient(180deg, hsl(43 90% 55%), hsl(43 80% 45%))',
                                                boxShadow: '0 0 8px hsl(43 90% 55% / 0.4)',
                                            }}
                                        />
                                    )}
                                    <item.icon
                                        className="h-4 w-4 transition-all duration-200"
                                        strokeWidth={1.5}
                                        style={{
                                            filter: isActive ? 'drop-shadow(0 0 4px hsl(43 90% 55% / 0.35))' : undefined,
                                        }}
                                    />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-3 border-t" style={{ borderColor: 'hsl(216 20% 92%)' }}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigate('/home'); onClose(); }}
                    className="neu-press w-full justify-start gap-2 rounded-lg"
                    style={{ color: 'hsl(216 15% 50%)' }}
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar ao App
                </Button>
            </div>
        </div>
    );
}
