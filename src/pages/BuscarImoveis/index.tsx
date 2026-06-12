import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BuscarImoveisForm } from './components/BuscarImoveisForm'
import { PropertySearchResults } from './components/PropertySearchResults'
import { BuyerPdfPreviewDialog } from './components/BuyerPdfPreviewDialog'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import type { BuscarImoveisFormData } from '@/validators/BuscarImoveis'
import { useAuth } from '@/contexts/AuthContext'
import { EvaluationLoadingScreen } from '@/components/evaluation/EvaluationLoadingScreen'

type FlowStep = 'search' | 'results' | 'pdf'

export default function BuscarImoveis() {
  const { profile } = useAuth()
  const [flowStep, setFlowStep] = useState<FlowStep>('search')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PropertyForDisplay[]>([])
  const [selectedProperties, setSelectedProperties] = useState<PropertyForDisplay[]>([])
  const [searchCriteria, setSearchCriteria] = useState<BuscarImoveisFormData | null>(null)
  const [pdfOpen, setPdfOpen] = useState(false)

  const handleSearchResults = (
    results: PropertyForDisplay[],
    criteria: BuscarImoveisFormData
  ) => {
    setSearchResults(results)
    setSearchCriteria(criteria)
    setSelectedProperties([])
    if (results.length > 0) {
      setFlowStep('results')
    }
  }

  const handleBackToSearch = () => {
    setFlowStep('search')
    setSearchResults([])
    setSelectedProperties([])
  }

  const handleGeneratePdf = (selected: PropertyForDisplay[]) => {
    setSelectedProperties(selected)
    setPdfOpen(true)
  }

  const handleClosePdf = () => {
    setPdfOpen(false)
  }

  return (
    <DashboardLayout
      title="Buscar Imóveis"
      subtitle="Encontre imóveis disponíveis para compra"
    >
      <EvaluationLoadingScreen isOpen={isSearching} />
      
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {flowStep === 'search' && (
          <div className="flex-1 pb-8">
            <BuscarImoveisForm 
              onResults={handleSearchResults}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
          </div>
        )}

        {flowStep === 'results' && (
          <div className="flex-1">
            <PropertySearchResults
              properties={searchResults}
              searchCriteria={searchCriteria}
              onBack={handleBackToSearch}
              onGeneratePdf={handleGeneratePdf}
              pdfOpen={pdfOpen}
            />
          </div>
        )}

        {/* PDF Preview Dialog */}
        {selectedProperties.length > 0 && searchCriteria && (
          <BuyerPdfPreviewDialog
            open={pdfOpen}
            onClose={handleClosePdf}
            properties={selectedProperties}
            searchCriteria={searchCriteria}
            broker={profile}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
