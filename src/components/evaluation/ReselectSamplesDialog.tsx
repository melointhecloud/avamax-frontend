 import { useState, useMemo, useEffect } from 'react'
 import {
   Dialog,
   DialogContent,
 } from '@/components/ui/dialog'
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from '@/components/ui/alert-dialog'
 import { Button } from '@/components/ui/button'
 import { Badge } from '@/components/ui/badge'
 import { AlertTriangle, Loader2, Sparkles, CreditCard } from 'lucide-react'
 import { SimilarPropertiesGrid } from './SimilarPropertiesGrid'
 import { EvaluationLoadingScreen } from './EvaluationLoadingScreen'
 import type { SimilarPropertyData } from './SimilarPropertyCard'
 import { supabase } from '@/integrations/supabase/client'
 import { toast } from 'sonner'
 import { useQueryClient } from '@tanstack/react-query'
 
 const BUSCAR_SIMILARES_URL =
   'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/buscar-similares'

 const parseCurrency = (v: unknown): number => {
   if (v == null) return 0
   if (typeof v === 'number') return v
   return (
     Number(String(v).replace(/[^\d,]/g, '').replace(',', '.')) || 0
   )
 }
 
 interface ReselectSamplesDialogProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   samples: any[] // Amostras originais do banco (resultado.similares)
   currentSelectedIds: number[]
   evaluationId: number
   tipoAvaliacao: 'venda' | 'aluguel'
   evaluationInput: {
     estado: string
     municipio: string
     bairro: string
      rua?: string
     categoria: string
     areaTotal?: number
     area?: number
     quartos?: number
     banheiros?: number
     vagas?: number
   }
   onSuccess: (payload: {
     avaliacaoId: number
     valor_estimado: number
     minimo: number
     maximo: number
     confianca: number
     amostras: number
   }) => void
   onLoadingChange?: (isLoading: boolean) => void
 }
 
 export function ReselectSamplesDialog({
   open,
   onOpenChange,
   samples,
   currentSelectedIds,
   evaluationId,
   tipoAvaliacao,
   evaluationInput,
   onSuccess,
   onLoadingChange,
 }: ReselectSamplesDialogProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>(
      currentSelectedIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    )
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [isLoadingSimilares, setIsLoadingSimilares] = useState(false)
   const [allSimilares, setAllSimilares] = useState<any[]>(samples)
   const [hasFetchedSimilares, setHasFetchedSimilares] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
   const queryClient = useQueryClient()

   // Handler para adicionar imóvel manualmente
   const handleAddManualProperty = (property: SimilarPropertyData) => {
     // Map SimilarPropertyData back to the internal format used by the DB samples
     // The `raw` field must mirror exactly what comes from the bank, so that:
     // 1. transformedSamples (which reads raw.Metros, raw.Quartos, etc.) renders correctly
     // 2. The edge function receives enough data to calculate the weighted average
     const rawPopulado = {
       Metros: property.metros ?? 0,
       Quartos: property.quartos ?? 0,
       Banheiros: property.banheiros ?? 0,
       Vagas: property.vagas ?? 0,
       Categoria: property.categoria ?? '',
       Descricao: property.descricao ?? '',
       Midia_Imovel: property.imagem ?? '',
       Bairro: property.bairro ?? '',
       Link: property.link ?? '',
       Titulo: property.categoria ?? 'Imóvel adicionado manualmente',
       Valor: property.valor ?? 0,
     }
     setAllSimilares(prev => [{ ...property, valor: property.valor, raw: rawPopulado }, ...prev])
   }

    // Sempre que abrir (ou mudar de avaliação), reseta o estado para
    // 1) manter as amostras atuais visíveis imediatamente
    // 2) refazer a busca de similares com o mesmo fluxo do Avaliar Imóvel
    useEffect(() => {
      if (!open) return
      setSelectedIds(
        currentSelectedIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      )
      setAllSimilares(samples)
      setHasFetchedSimilares(false)
    }, [open, evaluationId])
 
   // Buscar todos os similares disponíveis quando o diálogo abre
   useEffect(() => {
     if (open && !hasFetchedSimilares) {
       fetchAllSimilares()
     }
   }, [open, hasFetchedSimilares])
 
   const fetchAllSimilares = async () => {
     setIsLoadingSimilares(true)
     try {
       const { data: { session } } = await supabase.auth.getSession()
       if (!session?.access_token) {
         throw new Error('Usuário não autenticado')
       }
 
        // Mesmo fluxo do Avaliar Imóvel: fetch direto com Authorization
        const payload = {
          estado: evaluationInput.estado,
          municipio: evaluationInput.municipio,
          bairro: evaluationInput.bairro,
          rua: evaluationInput.rua,
          categoria: evaluationInput.categoria,
          area: evaluationInput.areaTotal ?? evaluationInput.area,
          quartos: evaluationInput.quartos,
          banheiros: evaluationInput.banheiros,
          vagas: evaluationInput.vagas,
        }

        const res = await fetch(BUSCAR_SIMILARES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        })

        const result = await res.json()

        if (!res.ok) {
          throw new Error(result?.error || 'Erro ao buscar imóveis similares')
        }

        const similaresBuscados = (result?.similares || []) as any[]

        // Mesclar similares buscados com as amostras originais (dedupe por ID numérico)
        const idsOriginais = new Set(samples.map((s: any) => Number(s.id)))
        const novos = similaresBuscados.filter(
          (s: any) => !idsOriginais.has(Number(s.id))
        )

        setAllSimilares([...samples, ...novos])
        console.log(
          `[ReselectSamplesDialog] Encontrados ${similaresBuscados.length} similares, ${novos.length} novos`,
        )
       
       setHasFetchedSimilares(true)
     } catch (err: any) {
       console.error('Erro ao buscar similares:', err)
       // Fallback: usar apenas as amostras já selecionadas
       setAllSimilares(samples)
       setHasFetchedSimilares(true)
        toast.error('Não foi possível buscar mais imóveis similares')
     } finally {
       setIsLoadingSimilares(false)
     }
   }
 
   // Transforma amostras do banco para o formato esperado pelo SimilarPropertiesGrid
   const transformedSamples = useMemo<SimilarPropertyData[]>(() => {
     return allSimilares.map((s, index) => {
       const raw = s.raw || {}
        const idNum = Number(s.id)
        const baseVenda = raw?.Valor != null ? parseCurrency(raw.Valor) : Number(s.valor) || 0
        const valorFinal = tipoAvaliacao === 'aluguel' ? Math.round(baseVenda * 0.005) : baseVenda
       return {
          id: Number.isFinite(idNum) ? idNum : index,
          valor: valorFinal,
         metros: Number(raw.Metros) || Number(s.area) || Number(s.metros) || 0,
         quartos: Number(raw.Quartos) ?? s.quartos ?? null,
         banheiros: Number(raw.Banheiros) ?? s.banheiros ?? null,
         vagas: Number(raw.Vagas) ?? s.vagas ?? null,
         categoria: raw.Categoria || s.categoria || s.titulo || null,
         descricao: raw.Descricao || s.descricao || null,
         imagem: raw.Midia_Imovel || s.imagem || null,
         bairro: raw.Bairro || s.bairro || null,
         link: raw.Link || s.link || null,
         score: s.score,
         mesmoBairro: s.mesmoBairro,
       }
     })
    }, [allSimilares, tipoAvaliacao])
 
    const handleRequestConfirm = () => {
     if (selectedIds.length < 3) {
       toast.error('Selecione pelo menos 3 amostras')
       return
     }
      setShowConfirmDialog(true)
    }
 
    const handleConfirm = async () => {
      setShowConfirmDialog(false)
     setIsSubmitting(true)
     // Fecha o dialog e notifica que está carregando para mostrar tela de loading
     onOpenChange(false)
     onLoadingChange?.(true)
 
     try {
       const { data: { session } } = await supabase.auth.getSession()
       if (!session?.access_token) {
         throw new Error('Usuário não autenticado')
       }
 
       // Filtrar as amostras selecionadas
        const similaresSelecionados = allSimilares.filter((s) =>
          selectedIds.includes(Number(s.id))
        )
 
       const response = await fetch(
         'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/recalcular-avaliacao',
         {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${session.access_token}`,
           },
           body: JSON.stringify({
             avaliacaoId: evaluationId,
             similaresIds: selectedIds,
             // Enviar os dados completos das amostras para incluir novos imóveis
             similares: similaresSelecionados,
             // Tipo de avaliação para a edge function aplicar conversão correta
             tipo_avaliacao: tipoAvaliacao,
           }),
         }
       )
 
       const result = await response.json()
 
       if (!response.ok) {
         throw new Error(result.error || 'Erro ao recalcular')
       }
 
       // Invalida queries para forçar refresh dos dados
       queryClient.invalidateQueries({ queryKey: ['dashboard'] })
       queryClient.invalidateQueries({ queryKey: ['evaluations'] })
       queryClient.invalidateQueries({ queryKey: ['user-credits'] })
       // Invalida também a avaliação específica
       queryClient.invalidateQueries({ queryKey: ['avaliacao', evaluationId] })
 
       toast.success('Nova avaliação gerada com sucesso!')
 
       onLoadingChange?.(false)
       onSuccess({
         avaliacaoId: result.avaliacao_id,
         valor_estimado: result.valor_estimado,
         minimo: result.minimo,
         maximo: result.maximo,
         confianca: result.confianca,
         amostras: result.amostras,
       })
     } catch (err: any) {
       console.error('Erro ao re-selecionar amostras:', err)
       toast.error(err.message || 'Erro ao gerar nova avaliação')
       onLoadingChange?.(false)
     } finally {
       setIsSubmitting(false)
     }
   }
    // Contadores para UI
    const totalSamples = transformedSamples.length
    const originalCount = samples.length
    const newCount = totalSamples - originalCount
 
   return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
            {/* Header compacto */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">Re-selecionar Amostras</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Escolha as amostras para o novo estudo</span>
                    {!isLoadingSimilares && newCount > 0 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        +{newCount} novos
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Área principal - Grid de amostras */}
            <div className="flex-1 overflow-hidden relative">
              {isLoadingSimilares && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Buscando imóveis similares...</p>
                  </div>
               </div>
              )}
              <div className="h-full overflow-auto p-4">
                <SimilarPropertiesGrid
                  properties={transformedSamples}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onBack={() => onOpenChange(false)}
                  onConfirm={handleRequestConfirm}
                  isLoading={isSubmitting}
                  tipoAvaliacao={tipoAvaliacao}
                  confirmLabel={
                    isSubmitting
                      ? 'Gerando nova avaliação...'
                      : `Gerar nova avaliação (${selectedIds.length} amostras)`
                  }
                  onAddManualProperty={handleAddManualProperty}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmação de consumo de crédito */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Confirmar nova avaliação
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Você selecionou <strong>{selectedIds.length} amostras</strong> para gerar uma
                  nova avaliação.
                </p>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Esta ação consumirá 1 crédito
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uma nova avaliação será gerada com base nas amostras selecionadas. A
                      avaliação atual permanecerá inalterada.
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Confirmar e gerar
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
   )
 }