import { useEffect, useCallback, useMemo } from 'react'
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog'
 import { Button } from '@/components/ui/button'
 import { Badge } from '@/components/ui/badge'
 import { Checkbox } from '@/components/ui/checkbox'
 import { ScrollArea } from '@/components/ui/scroll-area'
 import {
   ChevronLeft,
   ChevronRight,
   Bed,
   Bath,
   Car,
   Maximize,
   MapPin,
   ExternalLink,
   TrendingDown,
   Phone,
   Copy,
 } from 'lucide-react'
 import { cn } from '@/lib/utils'
import { getMultipleImagesForPdf } from '@/lib/pdf/pdfImages'
import { ImageCarousel } from '@/components/images/ImageCarousel'
 import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
 import { supabase } from '@/integrations/supabase/client'
 import { toast } from 'sonner'
 
 interface PropertyDetailDialogProps {
   property: PropertyForDisplay | null
   isOpen: boolean
   onOpenChange: (open: boolean) => void
   isSelected: boolean
   onToggleSelection: (id: number) => void
   onPrevious: () => void
   onNext: () => void
   currentIndex: number
   totalCount: number
   hasPrevious: boolean
   hasNext: boolean
 }
 
 export function PropertyDetailDialog({
   property,
   isOpen,
   onOpenChange,
   isSelected,
   onToggleSelection,
   onPrevious,
   onNext,
   currentIndex,
   totalCount,
   hasPrevious,
   hasNext,
 }: PropertyDetailDialogProps) {
  const imageUrls = useMemo(() => getMultipleImagesForPdf(property?.imagem, 10), [property?.imagem])
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
       minimumFractionDigits: 0,
       maximumFractionDigits: 0,
     }).format(value)
   }
 
   // Keyboard navigation
   const handleKeyDown = useCallback(
     (e: KeyboardEvent) => {
       if (!isOpen) return
 
       switch (e.key) {
         case 'ArrowLeft':
           e.preventDefault()
           if (hasPrevious) onPrevious()
           break
         case 'ArrowRight':
           e.preventDefault()
           if (hasNext) onNext()
           break
         case ' ':
         case 'Enter':
           if (property && e.target === document.body) {
             e.preventDefault()
             onToggleSelection(property.id)
           }
           break
       }
     },
     [isOpen, hasPrevious, hasNext, onPrevious, onNext, property, onToggleSelection]
   )
 
   useEffect(() => {
     document.addEventListener('keydown', handleKeyDown)
     return () => document.removeEventListener('keydown', handleKeyDown)
   }, [handleKeyDown])
 
   if (!property) return null
 
   const valorM2 = property.metros > 0 ? property.valor / property.metros : 0
   const hasPriceHistory = property.valoresAnteriores && property.valoresAnteriores.trim() !== ''
 
   return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden w-[95vw] md:w-full">
         {/* Header with navigation */}
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 sm:gap-3">
             <Button
               variant="ghost"
               size="icon"
               onClick={onPrevious}
               disabled={!hasPrevious}
                className="h-7 w-7 sm:h-8 sm:w-8"
             >
               <ChevronLeft className="h-4 w-4" />
             </Button>
              <DialogTitle className="text-sm sm:text-base font-medium whitespace-nowrap">
               Imóvel {currentIndex + 1} de {totalCount}
             </DialogTitle>
             <Button
               variant="ghost"
               size="icon"
               onClick={onNext}
               disabled={!hasNext}
                className="h-7 w-7 sm:h-8 sm:w-8"
             >
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
         </DialogHeader>
 
          <div className="flex flex-col md:flex-row max-h-[calc(90vh-160px)] sm:max-h-[calc(90vh-180px)] overflow-hidden min-w-0">
           {/* Left: Image */}
            <div className="md:w-1/2 flex-shrink-0 bg-muted min-w-0">
              <div className="relative w-full h-44 sm:h-48 md:h-full min-h-[180px] md:min-h-[200px] overflow-hidden">
                <ImageCarousel urls={imageUrls} alt={property.categoria || 'Imóvel'} className="h-full w-full" />

               {/* Badges overlay on image */}
               <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                 {hasPriceHistory && (
                   <Badge className="bg-emerald-500/90 text-white border-0 gap-1 shadow-md">
                     <TrendingDown className="h-3 w-3" />
                     Preço reduzido
                   </Badge>
                 )}
                 {property.categoria && (
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-md">
                     {property.categoria}
                   </Badge>
                 )}
               </div>
 
               {/* Score badge */}
               {property.score > 0 && (
                 <div className="absolute top-3 right-3">
                   <Badge variant="outline" className="bg-background/80 backdrop-blur-sm shadow-md">
                     Score: {Math.round(property.score)}
                   </Badge>
                 </div>
               )}
             </div>
           </div>
 
           {/* Right: Information */}
            <ScrollArea className="flex-1 md:w-1/2 min-w-0">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
               {/* Price */}
               <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                   {formatCurrency(property.valor)}
                 </p>
                 <p className="text-sm text-muted-foreground">
                   {formatCurrency(valorM2)}/m²
                 </p>
               </div>
 
               {/* Location */}
               {(property.bairro || property.rua) && (
                 <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                   <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                   <span className="text-sm">
                     {property.rua ? `${property.rua}, ` : ''}
                     {property.bairro}
                   </span>
                 </div>
               )}

               {/* Specifications - compact grid */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  <div className="flex flex-col items-center p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                    <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mb-0.5" />
                    <span className="text-xs sm:text-sm font-semibold">{property.metros}</span>
                   <span className="text-[10px] text-muted-foreground">m²</span>
                 </div>
                  <div className="flex flex-col items-center p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                    <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mb-0.5" />
                    <span className="text-xs sm:text-sm font-semibold">{property.quartos ?? '-'}</span>
                   <span className="text-[10px] text-muted-foreground">Qts</span>
                 </div>
                  <div className="flex flex-col items-center p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                    <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mb-0.5" />
                    <span className="text-xs sm:text-sm font-semibold">{property.suites ?? '-'}</span>
                   <span className="text-[10px] text-muted-foreground">Suítes</span>
                 </div>
                  <div className="flex flex-col items-center p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                    <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mb-0.5" />
                    <span className="text-xs sm:text-sm font-semibold">{property.banheiros ?? '-'}</span>
                   <span className="text-[10px] text-muted-foreground">Ban</span>
                 </div>
                  <div className="flex flex-col items-center p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                    <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mb-0.5" />
                    <span className="text-xs sm:text-sm font-semibold">{property.vagas ?? '-'}</span>
                   <span className="text-[10px] text-muted-foreground">Vgs</span>
                 </div>
               </div>
 
               {/* Full Description */}
               {property.descricao && (
                 <div className="space-y-1.5">
                   <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</h4>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                     {property.descricao}
                   </p>
                 </div>
               )}

               {/* Advertiser & Phone */}
               {(property.anunciante || property.telefoneAnunciante) && (
                 <div className="space-y-2">
                   {property.anunciante && (
                     <p className="text-xs text-muted-foreground/70">
                       Anunciante: {property.anunciante}
                     </p>
                   )}
                   {property.telefoneAnunciante && (
                     <div className="flex items-center gap-2">
                       <a
                         href={`tel:${property.telefoneAnunciante}`}
                         onClick={async (e) => {
                           // Track call
                           const { data: session } = await supabase.auth.getSession()
                           if (session.session) {
                             supabase.from('ligacoes').insert({
                               user_id: session.session.user.id,
                               imovel_id: property.id,
                               telefone: property.telefoneAnunciante!,
                               origem: 'buscar',
                             }).then(() => {})
                           }
                         }}
                         className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                       >
                         <Phone className="h-4 w-4" />
                         {property.telefoneAnunciante}
                       </a>
                       <button
                         onClick={(e) => {
                           e.stopPropagation()
                           navigator.clipboard.writeText(property.telefoneAnunciante!)
                           toast.success('Telefone copiado!')
                         }}
                         className="inline-flex items-center justify-center h-8 w-8 rounded-md border hover:bg-muted transition-colors"
                       >
                         <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                       </button>
                     </div>
                   )}
                 </div>
               )}
               </div>
           </ScrollArea>
         </div>
 
         {/* Footer with actions */}
          <div className="border-t p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
           <Button
             variant="outline"
             onClick={onPrevious}
             disabled={!hasPrevious}
              className="gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm"
           >
             <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
           </Button>
 
           <Button
             variant={isSelected ? 'default' : 'outline'}
             onClick={() => onToggleSelection(property.id)}
             className={cn(
                'gap-1 sm:gap-2 min-w-[100px] sm:min-w-[160px] text-xs sm:text-sm',
               isSelected && 'bg-primary text-primary-foreground'
             )}
           >
             <Checkbox
               checked={isSelected}
               className="h-4 w-4 border-0 data-[state=checked]:bg-transparent data-[state=checked]:text-primary-foreground"
             />
             {isSelected ? 'Selecionado' : 'Selecionar'}
           </Button>
 
           <Button
             variant="outline"
             onClick={onNext}
             disabled={!hasNext}
              className="gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm"
           >
              <span className="hidden sm:inline">Próximo</span>
             <ChevronRight className="h-4 w-4" />
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   )
 }