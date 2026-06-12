import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import { cn } from '@/lib/utils'
import { Maximize2, Minimize2, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const userMarkerIcon = new L.DivIcon({
  className: 'custom-marker-user',
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const propertyMarkerIcon = new L.DivIcon({
  className: 'custom-marker-property',
  html: `
    <div style="
      background: linear-gradient(135deg, #1f2937, #374151);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const selectedPropertyMarkerIcon = new L.DivIcon({
  className: 'custom-marker-selected',
  html: `
    <div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

interface PropertyMapProps {
  properties: PropertyForDisplay[]
  userLocation: { lat: number; lng: number } | null
  selectedIds?: number[]
  onPropertyClick?: (id: number) => void
  className?: string
  /** Forces the map to be collapsed (useful when another modal is open) */
  forceCollapsed?: boolean
  /** Disables expand UI entirely */
  disableExpand?: boolean
}

// Component to fit bounds
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [map, bounds])
  
  return null
}

export function PropertyMap({
  properties,
  userLocation,
  selectedIds = [],
  onPropertyClick,
  className,
  forceCollapsed = false,
  disableExpand = false,
}: PropertyMapProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (forceCollapsed) setIsExpanded(false)
  }, [forceCollapsed])

  // Filter properties with valid coordinates
  const propertiesWithCoords = useMemo(() => {
    return properties.filter(
      (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
    )
  }, [properties])

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    const points: [number, number][] = []
    
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng])
    }
    
    propertiesWithCoords.forEach((p) => {
      if (p.latitude && p.longitude) {
        points.push([p.latitude, p.longitude])
      }
    })
    
    if (points.length === 0) return null
    if (points.length === 1) {
      // Single point - create small bounds around it
      const [lat, lng] = points[0]
      return L.latLngBounds(
        [lat - 0.01, lng - 0.01],
        [lat + 0.01, lng + 0.01]
      )
    }
    
    return L.latLngBounds(points)
  }, [propertiesWithCoords, userLocation])

  // Default center (Brazil)
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [-15.7801, -47.9292]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (!userLocation && propertiesWithCoords.length === 0) {
    return (
      <div className={cn(
        "bg-muted/50 rounded-lg flex items-center justify-center",
        "h-64",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum imóvel com coordenadas disponíveis</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-[54] bg-black/50"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={cn(
          // isolate + z-0 ensures Leaflet internal z-indexes don't leak outside this component
          'relative isolate z-0 rounded-lg overflow-hidden border shadow-lg pdf-hide',
          isExpanded ? 'fixed inset-4 z-[55]' : 'h-64',
          className
        )}
      >
      {/* Expand/Collapse Button */}
      {!disableExpand && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 z-10 shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Close button when expanded */}
      {isExpanded && !disableExpand && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-14 z-10 shadow-lg"
          onClick={() => setIsExpanded(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
          <span>Sua busca</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white shadow" />
          <span>Imóveis encontrados</span>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
            <span>Selecionados</span>
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
        scrollWheelZoom={isExpanded}
        zoomControl={isExpanded}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds bounds={bounds} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
            <Popup>
              <div className="text-center font-medium">
                📍 Localização da sua busca
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property markers */}
        {propertiesWithCoords.map((property) => {
          const isSelected = selectedIds.includes(property.id)
          return (
            <Marker
              key={property.id}
              position={[property.latitude!, property.longitude!]}
              icon={isSelected ? selectedPropertyMarkerIcon : propertyMarkerIcon}
              eventHandlers={{
                click: () => onPropertyClick?.(property.id),
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-bold text-lg text-primary">
                    {formatCurrency(property.valor)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {property.metros}m² • {property.quartos || 0} quartos
                  </p>
                  {property.bairro && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.bairro}
                    </p>
                  )}
                  {property.score !== undefined && (
                    <p className="text-xs mt-1">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {property.score}% similar
                      </span>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      </div>
    </>
  )
}
