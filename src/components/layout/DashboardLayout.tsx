import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileSidebar } from './MobileSidebar'
import { BrandedLoader } from '@/components/ui/BrandedLoader'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { useSurveyTrigger } from '@/hooks/useSurveyTrigger'
import { SatisfactionSurveyDialog } from '@/components/survey/SatisfactionSurveyDialog'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [evaluationsCount, setEvaluationsCount] = useState(0)
  const { loading, user, profile } = useAuth()
  const { shouldShow: showSurvey, dismiss: dismissSurvey } = useSurveyTrigger()
  const location = useLocation()

  // When inside RE/MAX layout, skip rendering Avaluz sidebar/header
  const isRemaxRoute = true

  useEffect(() => {
    const fetchEvaluationsCount = async () => {
      if (!user) return

      const { count } = await supabase
        .from('avaliacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setEvaluationsCount(count || 0)
    }

    fetchEvaluationsCount()
  }, [user])

  // Mostrar loader se carregando OU se tem user mas profile ainda não carregou
  if (loading) {
    return <BrandedLoader />
  }

  // Inside RE/MAX layout: render only children (RemaxDashboardLayout provides its own shell)
  if (isRemaxRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - Sheet */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content */}
      <div className={cn('flex min-h-screen flex-col transition-all lg:ml-64')}>
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          evaluationsCount={evaluationsCount}
        />
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>

      <SatisfactionSurveyDialog open={showSurvey} onClose={dismissSurvey} />
    </div>
  )
}
