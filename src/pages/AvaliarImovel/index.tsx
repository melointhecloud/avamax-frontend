import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AvaliarImovelForm } from './components/AvaliarImovelForm'

const AvaliarImovel = () => {
  return (
    <DashboardLayout
      title="Simulador de Avaliação"
      subtitle="Vamos clarear o valor do seu imóvel"
    >
      <AvaliarImovelForm />
    </DashboardLayout>
  )
}

export default AvaliarImovel
