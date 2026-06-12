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
  Search,
  SlidersHorizontal,
  Building2,
  FileText,
  TrendingUp,
  MapPin,
  Map,
} from 'lucide-react'
import { PropertyResultCard } from './PropertyResultCard'
 import { PropertyDetailDialog } from './PropertyDetailDialog'
import { PropertyMap } from '@/components/map/PropertyMap'
import { geocodeAddress } from '@/services/geocoding.service'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import type { BuscarImoveisFormData } from '@/validators/BuscarImoveis'
import { cn } from '@/lib/utils'

interface PropertySearchResultsProps {
  properties: PropertyForDisplay[]
  searchCriteria: BuscarImoveisFormData | null
  onBack: () => void
  onGeneratePdf: (selected: PropertyForDisplay[]) => void
  pdfOpen?: boolean
}

type SortOption =
  | 'score'
  | 'price_asc'
  | 'price_desc'
  | 'area_asc'
  | 'area_desc'
  | 'price_m2_asc'
  | 'price_m2_desc'

export function PropertySearchResults({
  properties,
  searchCriteria,
  onBack,
  onGeneratePdf,
  pdfOpen = false,
}: PropertySearchResultsProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('score')
  const [showMap, setShowMap] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
   const [expandedPropertyId, setExpandedPropertyId] = useState<number | null>(null)

  // When PDF preview is open, hide/collapse the map to avoid overlay issues.
  useEffect(() => {
    if (pdfOpen) {
      setShowMap(false)
    }
  }, [pdfOpen])

  // Geocode user's search location
  useEffect(() => {
    if (searchCriteria) {
      geocodeAddress(
        searchCriteria.bairro,
        searchCriteria.municipio,
        searchCriteria.estado
      ).then((result) => {
        if (result) {
          setUserLocation({ lat: result.lat, lng: result.lng })
        }
      })
    }
  }, [searchCriteria])

  const handlePropertyMapClick = (id: number) => {
    handleToggle(id)
  }

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(filteredProperties.map((p) => p.id))
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const filteredProperties = useMemo(() => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.descricao?.toLowerCase().includes(term) ||
          p.categoria?.toLowerCase().includes(term) ||
          p.bairro?.toLowerCase().includes(term) ||
          p.rua?.toLowerCase().includes(term)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
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
          return a.valor / (a.metros || 1) - b.valor / (b.metros || 1)
        case 'price_m2_desc':
          return b.valor / (b.metros || 1) - a.valor / (a.metros || 1)
        default:
          return 0
      }
    })

    return filtered
  }, [properties, searchTerm, sortBy])

   // Expand modal state
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

    const selected = properties.filter((p) => selectedIds.includes(p.id))
    const totalValue = selected.reduce((sum, p) => sum + p.valor, 0)
    const avgValue = totalValue / selected.length
    const avgM2 =
      selected.reduce((sum, p) => sum + p.valor / (p.metros || 1), 0) / selected.length

    return {
      count: selected.length,
      avgValue,
      avgM2,
    }
  }, [properties, selectedIds])

  const selectedProperties = properties.filter((p) => selectedIds.includes(p.id))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-4 mb-6 space-y-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Imóveis Encontrados</h2>
              {searchCriteria && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {searchCriteria.bairro}, {searchCriteria.municipio} -{' '}
                  {searchCriteria.estado}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <Building2 className="h-4 w-4" />
            {properties.length} encontrados
          </Badge>
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-1.5"
            disabled={pdfOpen}
          >
            <Map className="h-4 w-4" />
            {showMap ? 'Ocultar mapa' : 'Ver mapa'}
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, categoria ou endereço..."
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
                <SelectItem value="score">⭐ Relevância</SelectItem>
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
          </div>
          <p className="text-sm text-muted-foreground">
            <span
              className={cn(
                'font-medium',
                selectedIds.length > 0 ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {selectedIds.length}
            </span>{' '}
            selecionados
          </p>
        </div>
      </div>

      {/* Map Section */}
      {showMap && !pdfOpen && (
        <div className="px-4 mb-4">
          <PropertyMap
            properties={filteredProperties}
            userLocation={userLocation}
            selectedIds={selectedIds}
            onPropertyClick={handlePropertyMapClick}
            forceCollapsed={pdfOpen}
            disableExpand={pdfOpen}
          />
        </div>
      )}

      {/* Properties Grid */}
      <div className="flex-1 overflow-auto px-4">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum imóvel encontrado
            </p>
            <p className="text-sm text-muted-foreground/70">
              Tente ajustar os filtros de busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-32">
            {filteredProperties.map((property) => (
              <PropertyResultCard
                key={property.id}
                property={property}
                isSelected={selectedIds.includes(property.id)}
                onToggle={handleToggle}
                 onExpand={handleExpand}
              />
            ))}
          </div>
        )}
      </div>

       {/* Property Detail Dialog */}
       <PropertyDetailDialog
         property={expandedProperty}
         isOpen={expandedPropertyId !== null}
         onOpenChange={(open) => !open && setExpandedPropertyId(null)}
         isSelected={expandedPropertyId !== null && selectedIds.includes(expandedPropertyId)}
         onToggleSelection={handleToggle}
         onPrevious={handlePreviousProperty}
         onNext={handleNextProperty}
         currentIndex={expandedIndex}
         totalCount={filteredProperties.length}
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
                <TrendingUp className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Média:</span>{' '}
                  <span className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    }).format(stats.avgValue)}
                  </span>
                </div>
              </div>
              <div className="text-sm hidden sm:block">
                <span className="text-muted-foreground">R$/m² médio:</span>{' '}
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(stats.avgM2)}
                </span>
              </div>
            </div>
          )}

          {/* Generate PDF Button */}
          <Button
            size="lg"
            onClick={() => onGeneratePdf(selectedProperties)}
            disabled={selectedIds.length === 0}
            className="w-full sm:w-auto min-w-[200px] gap-2"
          >
            <FileText className="h-5 w-5" />
            {selectedIds.length > 0
              ? `Gerar PDF (${selectedIds.length})`
              : 'Selecione imóveis'}
          </Button>
        </div>
      </div>
    </div>
  )
}
