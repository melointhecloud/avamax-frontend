import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentEvaluations } from '@/components/dashboard/RecentEvaluations'
import { RecentNews } from '@/components/dashboard/RecentNews'
import { PropertyProfileCharts } from '@/components/dashboard/PropertyProfileCharts'
import { EvaluationsTimelineChart } from '@/components/dashboard/EvaluationsTimelineChart'
import { HomeAgendaSection } from '@/components/dashboard/HomeAgendaSection'
import { FileText, TrendingUp, Building, Trophy, Loader2 } from 'lucide-react'
import { useUserDashboard } from '@/hooks/useUserDashboard'
import { useNetworkLeaderboard } from '@/hooks/useNetworkLeaderboard'
import { useNavigate } from 'react-router-dom'
import { useTenantPrefix } from '@/hooks/useTenantPrefix'

const Home = () => {
  const { profile, loading } = useAuth()
  const { data: dashboardData, isLoading: dashboardLoading } = useUserDashboard()
  const { data: rankingData, isLoading: rankingLoading } = useNetworkLeaderboard(10)
  const navigate = useNavigate()
  const p = useTenantPrefix()

  // Ranking data
  const userPosition = rankingData?.current_user?.position
  const evaluationsToTop10 = rankingData?.current_user?.evaluations_to_top_10 || 0
  const isInTop10 = userPosition && userPosition <= 10

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)} mil`
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate growth trend for evaluations
  const calculateEvaluationsTrend = () => {
    if (!dashboardData) return { value: 0, isPositive: true }
    const { monthlyEvaluations, previousMonthEvaluations } = dashboardData
    if (previousMonthEvaluations === 0) {
      const value = monthlyEvaluations > 0 ? 100 : 0
      return { value, isPositive: true }
    }
    const percentChange = Math.round(
      ((monthlyEvaluations - previousMonthEvaluations) / previousMonthEvaluations) * 100
    )
    return { value: Math.abs(percentChange), isPositive: percentChange >= 0 }
  }

  // Calculate trend for average value
  const calculateAverageTrend = () => {
    if (!dashboardData) return { value: 0, isPositive: true }
    const { averageValue, previousMonthAverageValue } = dashboardData
    if (previousMonthAverageValue === 0) {
      return { value: 0, isPositive: true }
    }
    const percentChange = Math.round(
      ((averageValue - previousMonthAverageValue) / previousMonthAverageValue) * 100
    )
    return { value: Math.abs(percentChange), isPositive: percentChange >= 0 }
  }

  const stats = {
    evaluations: dashboardData?.totalEvaluations ?? 0,
    totalValue: dashboardData?.totalValue ?? 0,
    avgValue: dashboardData?.averageValue ?? 0,
  }

  const recentEvaluations = dashboardData?.recentEvaluations ?? []
  const propertyTypeStats = dashboardData?.propertyTypeStats ?? {
    apartamento: 0,
    casa: 0,
    terreno: 0,
    comercial: 0,
    outro: 0,
  }
  const valueRangeStats = dashboardData?.valueRangeStats ?? {
    ate300k: 0,
    de300a600k: 0,
    acima600k: 0,
  }

  const evaluationsTrend = calculateEvaluationsTrend()
  const averageTrend = calculateAverageTrend()

  if (loading || dashboardLoading) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Olá, ${profile?.nome || profile?.email?.split('@')[0] || 'Usuário'}!`}
      subtitle="Bem-vindo ao seu painel de avaliações"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Grid - New KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatsCard
            title="Avaliações Concluídas"
            value={stats.evaluations}
            icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
            trend={evaluationsTrend}
          />
          <StatsCard
            title="Valor Total Avaliado"
            value={formatCurrency(stats.totalValue)}
            subtitle="volume financeiro analisado"
            icon={<Building className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
          />
          <StatsCard
            title="Valor Médio Avaliado"
            value={formatCurrencyFull(stats.avgValue)}
            icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
            trend={averageTrend}
          />
          <StatsCard
            title="Seu Ranking Avaluz"
            value={rankingLoading ? '...' : userPosition ? `#${userPosition}` : '-'}
            subtitle={
              isInTop10 
                ? 'Parabéns! Você está no Top 10' 
                : userPosition 
                  ? `+${evaluationsToTop10} para Top 10`
                  : 'faça avaliações para entrar'
            }
            icon={<Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
            onClick={() => navigate(p('/rede'))}
            linkHint="Ver ranking"
          />
        </div>

        {/* Evaluations Timeline Chart */}
        <EvaluationsTimelineChart />

        {/* Profile Charts Section */}
        <PropertyProfileCharts 
          propertyTypeStats={propertyTypeStats} 
          valueRangeStats={valueRangeStats} 
        />

        {/* Agenda Section */}
        <HomeAgendaSection />

        {/* Main Content Grid - Symmetric layout */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <RecentEvaluations evaluations={recentEvaluations} />
          <RecentNews />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Home