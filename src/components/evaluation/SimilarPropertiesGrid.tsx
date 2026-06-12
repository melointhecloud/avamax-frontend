import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal,
  Building2,
  TrendingUp,
  AlertCircle,
  Home,
   Key,
   Sparkles,
   Plus
} from 'lucide-react'
import { SimilarPropertyCard, type SimilarPropertyData } from './SimilarPropertyCard'
import { AddManualPropertyDialog } from './AddManualPropertyDialog'
 import { SimilarPropertyDetailDialog } from './SimilarPropertyDetailDialog'
import { PropertyMap } from '@/components/map/PropertyMap'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import { geocodeAddress } from '@/services/geocoding.service'
import { cn } from '@/lib/utils'

interface SimilarPropertiesGridProps {
  properties: SimilarPropertyData[]
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
  onBack: () => void
  onConfirm: () => void
  isLoading?: boolean
  minSelection?: number
  maxSelection?: number
  tipoAvaliacao?: 'venda' | 'aluguel'
   confirmLabel?: string
   showCreditWarning?: boolean
  bairro?: string
  municipio?: string
  estado?: string
  onAddManualProperty?: (property: SimilarPropertyData) => void
}

type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'price_m2_asc' | 'price_m2_desc'

export const SimilarPropertiesGrid = ({
  properties,
  selectedIds,
  onSelectionChange,
  onBack,
  onConfirm,
  isLoading = false,
  minSelection = 3,
  maxSelection = 20,
   tipoAvaliacao = 'venda',
   confirmLabel,
   showCreditWarning = false,
  bairro,
  municipio,
  estado,
  onAddManualProperty
}: SimilarPropertiesGridProps) => {
  const isRental = tipoAvaliacao === 'aluguel'
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [addManualDialogOpen, setAddManualDialogOpen] = useState(false)
   const [expandedPropertyId, setExpandedPropertyId] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Geocode reference location
  useEffect(() => {
    if (bairro || municipio) {
      geocodeAddress(bairro || '', municipio || '', estado || '').then(result => {
        if (result) setUserLocation({ lat: result.lat, lng: result.lng })
      })
    }
  }, [bairro, municipio, estado])

  // Convert SimilarPropertyData to PropertyForDisplay for the map
  const mapProperties: PropertyForDisplay[] = useMemo(() => 
    properties
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        id: p.id,
        valor: p.valor,
        metros: p.metros,
        quartos: p.quartos,
        banheiros: p.banheiros,
        vagas: p.vagas,
        suites: null,
        categoria: p.categoria,
        descricao: p.descricao,
        imagem: null,
        bairro: p.bairro || null,
        rua: null,
        anunciante: null,
        telefoneAnunciante: null,
        valoresAnteriores: null,
        disponivel: true,
        score: p.score ?? 0,
        mesmoBairro: p.mesmoBairro ?? false,
        link: p.link || null,
        latitude: p.latitude!,
        longitude: p.longitude!,
      })),
    [properties]
  )

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id))
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, id])
    }
  }

  const handleSelectAll = () => {
    const allIds = filteredProperties.slice(0, maxSelection).map(p => p.id)
    onSelectionChange(allIds)
  }

  const handleClearSelection = () => {
    onSelectionChange([])
  }

  const filteredProperties = useMemo(() => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.descricao?.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term) ||
        p.bairro?.toLowerCase().includes(term)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recommended':
          // Prioriza mesmo bairro, depois score
          if (a.mesmoBairro && !b.mesmoBairro) return -1
          if (!a.mesmoBairro && b.mesmoBairro) return 1
          return (b.score ?? 0) - (a.score ?? 0)
        case 'price_asc':
          return a.valor - b.valor
        case 'price_desc':
          return b.valor - a.valor
        case 'area_asc':
          return a.metros - b.metros
        case 'area_desc':
          return b.metros - a.metros
        case 'price_m2_asc':
          return (a.valor / a.metros) - (b.valor / b.metros)
        case 'price_m2_desc':
          return (b.valor / b.metros) - (a.valor / a.metros)
        default:
          return 0
      }
    })

    return filtered
  }, [properties, searchTerm, sortBy])

   // Expand modal state - must come after filteredProperties is defined
   const handleExpand = (id: number) => {
     setExpandedPropertyId(id)
   }

   const expandedIndex = filteredProperties.findIndex(p => p.id === expandedPropertyId)
   const expandedProperty = expandedIndex >= 0 ? filteredProperties[expandedIndex] : null

   const handlePreviousProperty = () => {
     if (expandedIndex > 0) {
       setExpandedPropertyId(filteredProperties[expandedIndex - 1].id)
     }
   }

   const handleNextProperty = () => {
     if (expandedIndex < filteredProperties.length - 1) {
       setExpandedPropertyId(filteredProperties[expandedIndex + 1].id)
     }
   }

  const stats = useMemo(() => {
    if (selectedIds.length === 0) return null
    
    const selected = properties.filter(p => selectedIds.includes(p.id))
    const totalValue = selected.reduce((sum, p) => sum + p.valor, 0)
    const avgValue = totalValue / selected.length
    const avgM2 = selected.reduce((sum, p) => sum + (p.valor / p.metros), 0) / selected.length
    
    return {
      count: selected.length,
      avgValue,
      avgM2
    }
  }, [properties, selectedIds])

  const canConfirm = selectedIds.length >= minSelection

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-4 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Imóveis Similares</h2>
                <Badge 
                  className={isRental 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1' 
                    : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 gap-1'
                  }
                >
                  {isRental ? <><Key className="h-3 w-3" /> Aluguel</> : <><Home className="h-3 w-3" /> Venda</>}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRental 
                  ? 'Valores convertidos para estimativa de aluguel mensal'
                  : 'Selecione os imóveis que melhor representam a comparação'
                }
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <Building2 className="h-4 w-4" />
            {properties.length} encontrados
          </Badge>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, categoria ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">⭐ Indicados</SelectItem>
                <SelectItem value="price_desc">Maior preço</SelectItem>
                <SelectItem value="price_asc">Menor preço</SelectItem>
                <SelectItem value="area_desc">Maior área</SelectItem>
                <SelectItem value="area_asc">Menor área</SelectItem>
                <SelectItem value="price_m2_desc">Maior R$/m²</SelectItem>
                <SelectItem value="price_m2_asc">Menor R$/m²</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={filteredProperties.length === 0}
            >
              Selecionar todos
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              disabled={selectedIds.length === 0}
            >
              Limpar seleção
            </Button>
            {onAddManualProperty && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAddManualDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar imóvel
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className={cn(
              "font-medium",
              selectedIds.length >= minSelection ? "text-primary" : "text-destructive"
            )}>
              {selectedIds.length}
            </span>
            /{maxSelection} selecionados 
            <span className="text-xs ml-1">(mín. {minSelection})</span>
          </p>
        </div>
      </div>

      {/* Map */}
      {mapProperties.length > 0 && (
        <div className="mb-6">
          <PropertyMap
            properties={mapProperties}
            userLocation={userLocation}
            selectedIds={selectedIds}
            onPropertyClick={handleToggle}
            disableExpand={false}
          />
        </div>
      )}

      {/* Properties Grid */}
      <div className="flex-1 overflow-auto">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum imóvel encontrado</p>
            <p className="text-sm text-muted-foreground/70">
              Tente ajustar os filtros de busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-32">
            {filteredProperties.map((property) => (
              <SimilarPropertyCard
                key={property.id}
                property={property}
                isSelected={selectedIds.includes(property.id)}
                onToggle={handleToggle}
                 onExpand={handleExpand}
                isRental={isRental}
              />
            ))}
          </div>
        )}
      </div>

       {/* Property Detail Dialog */}
       <SimilarPropertyDetailDialog
         property={expandedProperty}
         isOpen={expandedPropertyId !== null}
         onOpenChange={(open) => !open && setExpandedPropertyId(null)}
         isSelected={expandedPropertyId !== null && selectedIds.includes(expandedPropertyId)}
         onToggleSelection={handleToggle}
         onPrevious={handlePreviousProperty}
         onNext={handleNextProperty}
         currentIndex={expandedIndex}
         totalCount={filteredProperties.length}
         isRental={isRental}
         hasPrevious={expandedIndex > 0}
         hasNext={expandedIndex < filteredProperties.length - 1}
       />

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t p-4 shadow-lg">
        <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${isRental ? 'text-emerald-500' : 'text-primary'}`} />
                <div className="text-sm">
                  <span className="text-muted-foreground">{isRental ? 'Aluguel médio:' : 'Média:'}</span>{' '}
                  <span className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0
                    }).format(stats.avgValue)}
                    {isRental && <span className="text-xs font-normal">/mês</span>}
                  </span>
                </div>
              </div>
              <div className="text-sm hidden sm:block">
                <span className="text-muted-foreground">R$/m² médio{isRental && ' (mensal)'}:</span>{' '}
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  }).format(stats.avgM2)}
                </span>
              </div>
            </div>
          )}

          {/* Warning if not enough selected */}
          {!canConfirm && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Selecione pelo menos {minSelection} imóveis</span>
            </div>
          )}

          {/* Confirm Button */}
          <Button 
            size="lg" 
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            className="w-full sm:w-auto min-w-[200px] gap-2"
          >
             {isLoading ? (
               <Sparkles className="h-5 w-5 animate-pulse" />
             ) : (
               <CheckCircle2 className="h-5 w-5" />
             )}
             {confirmLabel || (isLoading ? 'Gerando avaliação...' : 'Confirmar seleção')}
          </Button>
        </div>
      </div>

      {/* Add Manual Property Dialog */}
      {onAddManualProperty && (
        <AddManualPropertyDialog
          open={addManualDialogOpen}
          onOpenChange={setAddManualDialogOpen}
          onPropertyAdded={(property) => {
            onAddManualProperty(property)
            // Auto-selecionar o imóvel adicionado
            if (!selectedIds.includes(property.id)) {
              if (selectedIds.length < maxSelection) {
                onSelectionChange([...selectedIds, property.id])
              } else {
                // Importar toast diretamente para evitar dependência circular
                import('sonner').then(({ toast }) => {
                  toast.warning(`Imóvel adicionado! Desmarque um imóvel existente para incluí-lo na seleção (limite: ${maxSelection}).`)
                })
              }
            }
          }}
        />
      )}
    </div>
  )
}
