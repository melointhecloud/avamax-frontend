import { Home, Search, FileText, CreditCard, Download, Users, GraduationCap, Newspaper, Globe, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { UserPopover } from './UserPopover'
import { useUserCredits } from '@/hooks/useUserCredits'
import logo from '@/assets/avaluz-logo-transparent.png'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const baseMenuItems = [
  { icon: Home, label: 'Início', path: '/home' },
  { icon: Globe, label: 'Rede Avaluz', path: '/rede' },
  { icon: Search, label: 'Avaliar Imóvel', path: '/avaliar' },
  { icon: ShoppingBag, label: 'Buscar Imóveis', path: '/buscar-imoveis' },
  { icon: FileText, label: 'Histórico', path: '/historico' },
  { icon: CreditCard, label: 'Financeiro', path: '/creditos' },
  { icon: Newspaper, label: 'Noticiário', path: '/noticiario' },
  { icon: GraduationCap, label: 'Tutorial AvaLuz', path: '/tutorial-avaluz' },
  { icon: Download, label: 'Instale o App', path: '/tutorial' },
]

const teamMenuItem = { icon: Users, label: 'Meu Time', path: '/time/home' }


interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MobileSidebar = ({ open, onOpenChange }: MobileSidebarProps) => {
  const { profile } = useAuth()
  const { data: userCredits, isLoading: creditsLoading } = useUserCredits()

  // Build menu items conditionally - only show "Meu Time" for team owners
  const menuItems = [...baseMenuItems]
  if (!creditsLoading && userCredits?.is_owner) {
    // Insert "Meu Time" after "Financeiro" (index 6)
    menuItems.splice(6, 0, teamMenuItem)
  }


  const getInitials = () => {
    if (profile?.nome) {
      return profile.nome
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navegação</SheetTitle>
        </SheetHeader>

        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-border px-4">
          <img alt="Avaluz" className="h-[8.75rem] w-auto" src={logo} />
        </div>

        {/* Navigation - Scrollable area for all menu items */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Block */}
        {profile && (
          <div className="border-t border-border p-4">
            <UserPopover>
              <button className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted">
                <div
                  className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground overflow-hidden'
                  )}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">
                    {profile.nome || profile.email || 'Usuário'}
                  </p>
                  {profile.creci && (
                    <p className="truncate text-xs text-muted-foreground">
                      CRECI: {profile.creci}
                    </p>
                  )}
                  {!profile.creci && (
                    <p className="text-xs text-muted-foreground">
                      {userCredits?.available ?? profile.credits ?? 0} créditos
                    </p>
                  )}
                </div>
              </button>
            </UserPopover>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
