import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Settings, Building2, BadgeCheck } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface UserPopoverProps {
  children: React.ReactNode
}

export const UserPopover = ({ children }: UserPopoverProps) => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getSettingsPath = () => {
    if (location.pathname.startsWith('/mfr/')) return '/mfr/configuracoes'
    return '/configuracoes'
  }

  // Se não tem profile, renderiza apenas o children sem popover
  if (!profile) {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth/signin')
  }

  const getInitials = () => {
    if (profile?.nome) {
      return profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-72 p-0", "tenant-theme")}
        align="start" 
        side="top"
        sideOffset={8}
      >
        {/* Header com Avatar e Nome */}
        <div className="flex items-center gap-3 p-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg overflow-hidden ring-2 ring-border'
            )}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-foreground">
              {profile?.nome || 'Usuário'}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </div>

        <Separator />

        {/* Informações Profissionais */}
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
            <p className="text-sm text-muted-foreground italic">
              Complete seu perfil nas configurações
            </p>
          )}
        </div>

        <Separator />

        {/* Ações */}
        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(getSettingsPath())}
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
  )
}
