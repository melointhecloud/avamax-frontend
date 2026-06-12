import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  MapPin,
  ImageOff,
   ExternalLink,
   Eye,
   Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMultipleImagesForPdf } from '@/lib/pdf/pdfImages'

export interface SimilarPropertyData {
  id: number
  valor: number
  metros: number
  quartos: number | null
  banheiros: number | null
  vagas: number | null
  categoria: string | null
  descricao: string | null
  imagem: unknown | null
  bairro?: string | null
  link?: string | null
  score?: number           // Score de similaridade (0-100)
  mesmoBairro?: boolean    // Se é do mesmo bairro
  latitude?: number | null
  longitude?: number | null
  telefoneAnunciante?: string | null
  _isManual?: boolean      // Imóvel adicionado manualmente (não existe no banco)
}

interface SimilarPropertyCardProps {
  property: SimilarPropertyData
  isSelected: boolean
  onToggle: (id: number) => void
   onExpand?: (id: number) => void
  isRental?: boolean
}

export const SimilarPropertyCard = ({ 
  property, 
  isSelected, 
  onToggle,
   onExpand,
  isRental = false
}: SimilarPropertyCardProps) => {
  const [imageError, setImageError] = useState(false)
  
  // Extract first image for card display
  const imageUrls = property.imagem ? getMultipleImagesForPdf(property.imagem, 1) : []
  const firstImageUrl = imageUrls[0] || null
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const valorM2 = property.metros > 0 
    ? property.valor / property.metros 
    : 0

  const hasImage = firstImageUrl && !imageError

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:shadow-lg",
        property.score && property.score > 95
          ? "golden-spark-border shadow-md"
          : "overflow-hidden",
        !(property.score && property.score > 95) && isSelected && "ring-2 ring-primary bg-primary/5 shadow-md",
        !(property.score && property.score > 95) && !isSelected && "hover:ring-1 hover:ring-muted-foreground/20"
      )}
      onClick={() => onToggle(property.id)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-20">
        <div 
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-all",
            isSelected 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-background/80 backdrop-blur-sm border"
          )}
        >
          <Checkbox 
            checked={isSelected}
            className="h-4 w-4 border-0 data-[state=checked]:bg-transparent data-[state=checked]:text-primary-foreground"
          />
        </div>
      </div>

      {/* External Link */}
      {property.link && (
        <a
          href={property.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      )}

       {/* Expand Button */}
       {onExpand && (
         <button
           onClick={(e) => {
             e.stopPropagation()
             onExpand(property.id)
           }}
           className={cn(
             "absolute z-20 flex h-8 items-center justify-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm border transition-all hover:bg-background px-3",
             "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
             property.link ? "top-3 right-12" : "top-3 right-3"
           )}
         >
           <Eye className="h-4 w-4 text-muted-foreground" />
           <span className="text-xs font-medium text-muted-foreground">Ver mais</span>
         </button>
       )}

      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {/* Score Badge */}
        {property.score != null && (
          <div className={cn(
            "absolute top-12 right-3 z-10 px-2 py-1 rounded text-[10px] font-bold tracking-wide",
            property.score > 95 
              ? "bg-yellow-400/90 text-yellow-950" 
              : "bg-black/60 text-white backdrop-blur-sm"
          )}>
            SCORE: {Math.round(property.score)}
          </div>
        )}
        {hasImage ? (
          <img
            src={firstImageUrl!}
            alt={property.categoria || 'Imóvel'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Price Badge Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white drop-shadow-md">
                {formatCurrency(property.valor)}{isRental && <span className="text-sm font-normal">/mês</span>}
              </p>
              <p className="text-sm text-white/80">
                {formatCurrency(valorM2)}/m²{isRental && ' (mensal)'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {property.mesmoBairro && (
                 <Badge className={cn(
                   "text-white backdrop-blur-sm border-0 text-xs",
                   isRental ? "bg-emerald-500/90" : "bg-[#DF6009]/90"
                 )}>
                  Mesmo bairro
                </Badge>
              )}
              {property.categoria && (
                <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0">
                  {property.categoria}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Location */}
        {property.bairro && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{property.bairro}</span>
          </div>
        )}

        {/* Property Features */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Maximize className="h-4 w-4" />
            <span className="font-medium text-foreground">{property.metros}</span>
            <span>m²</span>
          </div>
          
          {property.quartos !== null && property.quartos > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span className="font-medium text-foreground">{property.quartos}</span>
            </div>
          )}
          
          {property.banheiros !== null && property.banheiros > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bath className="h-4 w-4" />
              <span className="font-medium text-foreground">{property.banheiros}</span>
            </div>
          )}
          
          {property.vagas !== null && property.vagas > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span className="font-medium text-foreground">{property.vagas}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {property.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {property.descricao}
          </p>
        )}
      </CardContent>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-primary rounded-lg" />
      )}
    </Card>
  )
}
