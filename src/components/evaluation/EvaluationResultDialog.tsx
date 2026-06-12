import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  Pencil, 
  History, 
  X,
  FileText,
  Presentation
} from 'lucide-react'

import { EvaluationValueCard } from './EvaluationValueCard'
import { EvaluationSummaryChips } from './EvaluationSummaryChips'
import { PdfPreviewDialog } from '@/components/pdf/PdfPreviewDialog'
import { TenantPdfPreviewDialog } from '@/components/pdf/TenantPdfPreviewDialog'
import { useTenant } from '@/contexts/TenantContext'
import { PdfReportEditor } from '@/components/pdf/PdfReportEditor'
import { PresentationMode } from '@/components/pdf/PresentationMode'

import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import type { EvaluationResult } from '@/types/evaluation'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrlForPdf } from '@/lib/pdfImages'
import { supabase } from '@/integrations/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

interface EvaluationResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluationId: number
  inputPayload: AvaliarImovelFormData
  resultPayload: EvaluationResult
  onRecalculate?: (newData: AvaliarImovelFormData) => Promise<void>
  isRecalculating?: boolean
  images?: File[]
}

// Fire confetti celebration
const fireConfetti = () => {
  const duration = 2000
  const end = Date.now() + duration

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

export function EvaluationResultDialog({
  open,
  onOpenChange,
  evaluationId,
  inputPayload,
  resultPayload,
  images
}: EvaluationResultDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const tenant = useTenant()
  const isRemax = true
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const [hasShownConfetti, setHasShownConfetti] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfEditorOpen, setPdfEditorOpen] = useState(false)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [customReportData, setCustomReportData] = useState<any>(null)
  const [currentResult, setCurrentResult] = useState(resultPayload)
  const [currentEvaluationId, setCurrentEvaluationId] = useState(evaluationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Determina se é avaliação de aluguel
  const isRental = inputPayload.tipoAvaliacao === 'aluguel'

  // Atualiza currentEvaluationId quando prop muda
  useEffect(() => {
    setCurrentEvaluationId(evaluationId)
  }, [evaluationId])

  // Atualiza currentResult quando resultPayload muda
  useEffect(() => {
    setCurrentResult(resultPayload)
  }, [resultPayload])

  // Scroll to top when dialog opens
  useEffect(() => {
    if (open && scrollRef.current) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0 })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Fire confetti when dialog opens
  useEffect(() => {
    if (open && !hasShownConfetti) {
      // Small delay for dialog animation to complete
      const timer = setTimeout(() => {
        fireConfetti()
        setHasShownConfetti(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open, hasShownConfetti])

  // Reset confetti flag when dialog closes
  useEffect(() => {
    if (!open) {
      setHasShownConfetti(false)
    }
  }, [open])

  // Calculate valor/m2
  const valorM2 = inputPayload.areaTotal > 0 
    ? currentResult.valor_estimado / inputPayload.areaTotal 
    : 0

  // Resolve foto de capa: prioriza images[], senão usa input.foto_capa
  const resolvedCoverPhoto = images?.[0] 
    ? URL.createObjectURL(images[0]) 
    : (inputPayload as any).foto_capa || null

  // Transform data for PDF - inclui todos os dados do formulário
  const baseReportData = {
    clientName: profile?.nome || (user?.email ?? 'Cliente'),
    client: inputPayload.clienteAtivo && inputPayload.clienteNome ? {
      nome: inputPayload.clienteNome,
      email: inputPayload.clienteEmail || undefined,
      telefone: inputPayload.clienteTelefone || undefined,
    } : undefined,
    property: {
      id: currentEvaluationId,
      rua: inputPayload.rua || '',
      bairro: inputPayload.bairro || '',
      municipio: inputPayload.municipio || '',
      estado: inputPayload.estado || '',
      area: inputPayload.areaTotal || 0,
      quartos: inputPayload.quartos || 0,
      suites: inputPayload.suites || 0,
      banheiros: inputPayload.banheiros || 0,
      vagas: inputPayload.vagas || 0,
      valor_atual: resultPayload.valor_estimado,
      tipo: inputPayload.categoria || 'Imóvel',
      foto_capa: resolvedCoverPhoto,
      // Dados extras do formulário
      cep: inputPayload.cep || undefined,
      condominio: inputPayload.condominio || undefined,
      iptu: inputPayload.iptu || undefined,
      aVenda: inputPayload.aVenda || false,
      linkVenda: inputPayload.linkVenda || undefined,
      mobiliado: inputPayload.mobiliado || undefined,
      situacaoLegal: inputPayload.situacaoLegal || undefined,
      locaisProximos: inputPayload.locaisProximos || undefined,
      descricao: inputPayload.descricao || undefined,
      // Avaliações (1-5)
      avaliacaoTecnica: inputPayload.avaliacaoTecnica || undefined,
      localizacao: inputPayload.localizacao || undefined,
      planta: inputPayload.planta || undefined,
      acabamentos: inputPayload.acabamentos || undefined,
      conservacao: inputPayload.conservacao || undefined,
      areasComuns: inputPayload.areasComuns || undefined,
      // Features selecionadas
      features: inputPayload.features?.selected || [],
      // Especificações do tipo
      especificacoes: inputPayload.especificacoes || undefined,
    },
    market: {
      valor_estimado: currentResult.valor_estimado,
      confianca: currentResult.confianca,
      amostras: currentResult.similares?.length || 0,
      minimo: currentResult.minimo,
      medio: currentResult.valor_estimado,
      maximo: currentResult.maximo,
      similares: (currentResult.similares || []).map((s, index) => ({
        id: s.id || index,
        titulo: s.titulo || `Amostra ${index + 1}`,
        descricao: s.descricao || '',
        valor: s.valor || 0,
        area: s.area || 0,
        quartos: s.quartos || 0,
        suites: 0,
        banheiros: s.banheiros || 0,
        vagas: s.vagas || 0,
        imagem: getImageUrlForPdf(s.imagem),
        status: 'ativo' as const
      }))
    },
    broker: profile ? {
      nome: profile.nome,
      email: profile.email,
      creci: profile.creci,
      telefone: profile.telefone,
      avatar_url: profile.avatar_url,
      imobiliaria: profile.imobiliaria,
      logo_imobiliaria_url: profile.logo_imobiliaria_url,
      signature_url: profile.signature_url
    } : undefined,
    settings: {
      showMinimo: true,
      showMaximo: true
    }
  }

  // Dados para o PDF de Aluguel (calcula valores de locação)
  const taxaAluguel = 0.005; // ~0.5% do valor de venda
  const aluguelEstimado = Math.round(currentResult.valor_estimado * taxaAluguel);
  
  const baseRentalReportData = {
    ...baseReportData,
    market: {
      ...baseReportData.market,
      valor_estimado: aluguelEstimado,
      minimo: Math.round(aluguelEstimado * 0.85),
      medio: aluguelEstimado,
      maximo: Math.round(aluguelEstimado * 1.15),
      similares: (currentResult.similares || []).map((s, index) => ({
        id: s.id || index,
        titulo: s.titulo || `Amostra ${index + 1}`,
        descricao: s.descricao || '',
        valor: Math.round((s.valor || 0) * taxaAluguel), // Valor de aluguel
        area: s.area || 0,
        quartos: s.quartos || 0,
        suites: 0,
        banheiros: s.banheiros || 0,
        vagas: s.vagas || 0,
        imagem: getImageUrlForPdf(s.imagem),
        status: 'ativo' as const
      }))
    }
  };

  // Use custom data if available, otherwise base data
  const reportData = customReportData || baseReportData
  const rentalReportData = customReportData || baseRentalReportData

  const handleOpenPdfPreview = () => {
    setPdfPreviewOpen(true)
  }

  const handleOpenPdfEditor = () => {
    setPdfEditorOpen(true)
  }

  const handleOpenPresentation = () => {
    setPresentationOpen(true)
  }

  const handleSavePdfEdits = async (editedData: any) => {
    try {
      // Busca dados atuais da avaliação
      const { data: avaliacao, error: fetchError } = await supabase
        .from('avaliacoes')
        .select('resultado')
        .eq('id', currentEvaluationId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const resultado = avaliacao?.resultado as any || {};
      
      // Prepara os dados para salvar
      const updatedResultado = { ...resultado };
      
      if (isRental) {
        updatedResultado.pdf_settings_aluguel = {
          market: {
            valor_estimado: editedData.market?.valor_estimado,
            minimo: editedData.market?.minimo,
            maximo: editedData.market?.maximo,
            similares: editedData.market?.similares,
          },
          settings: editedData.settings,
          client: editedData.client,
          broker: editedData.broker,
        };
      } else {
        updatedResultado.pdf_settings = {
          market: {
            valor_estimado: editedData.market?.valor_estimado,
            minimo: editedData.market?.minimo,
            maximo: editedData.market?.maximo,
            similares: editedData.market?.similares,
          },
          settings: editedData.settings,
          client: editedData.client,
          broker: editedData.broker,
        };
      }
      
      // Salva no banco
      const { error: updateError } = await supabase
        .from('avaliacoes')
        .update({ resultado: updatedResultado })
        .eq('id', currentEvaluationId);
      
      if (updateError) throw updateError;
      
      setCustomReportData(editedData);
      setPdfEditorOpen(false);
      toast.success('Dados do PDF atualizados!');
    } catch (err: any) {
      console.error('Erro ao salvar PDF:', err);
      toast.error(err.message || 'Erro ao salvar alterações');
    }
  }

  const handleCancelPdfEdit = () => {
    setPdfEditorOpen(false)
  }

  const handleViewHistory = () => {
    onOpenChange(false)
    navigate(`/avaliacao/${currentEvaluationId}`)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          {/* Fixed Header */}
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${isRental ? 'text-emerald-500' : 'text-green-500'}`} />
              <DialogTitle>Avaliação Concluída</DialogTitle>
              <Badge 
                className={isRental 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300'
                }
              >
                {isRental ? 'Aluguel' : 'Venda'}
              </Badge>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
            <div className="p-6 space-y-6">
              {/* Value Card - mostra valores de aluguel ou venda */}
              <EvaluationValueCard
                valorEstimado={isRental ? baseRentalReportData.market.valor_estimado : currentResult.valor_estimado}
                valorM2={isRental ? (baseRentalReportData.market.valor_estimado / (inputPayload.areaTotal || 1)) : valorM2}
                confianca={currentResult.confianca}
                minimo={isRental ? baseRentalReportData.market.minimo : currentResult.minimo}
                maximo={isRental ? baseRentalReportData.market.maximo : currentResult.maximo}
              />

              <Separator />

              {/* Property Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground text-center">
                  Resumo do Imóvel
                </h4>
                <EvaluationSummaryChips input={inputPayload} />
              </div>

              {/* Observations */}
              {currentResult.observacoes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Observações
                    </h4>
                    <p className="text-sm text-foreground">
                      {currentResult.observacoes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t shrink-0 bg-background">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" onClick={handleOpenPdfEditor} className="gap-2">
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenPresentation} 
                className={`gap-2 ${isRental ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950' : 'text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950'}`}
              >
                <Presentation className="h-4 w-4" />
                <span className="hidden sm:inline">Apresentar</span>
              </Button>
              {/* 
                TEMPORARIAMENTE DESABILITADO - Botão de preview/download de PDF
                Reativar após correção do html2canvas
                
                <Button 
                  variant="outline" 
                  onClick={handleOpenPdfPreview} 
                  className={`gap-2 ${isRental ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Baixar PDF</span>
                </Button>
              */}
              <Button variant="outline" onClick={handleViewHistory} className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
              </Button>
              <Button variant="secondary" onClick={() => onOpenChange(false)} className="gap-2">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Fechar</span>
              </Button>
            </div>
          </div>

          {/* PDF Preview Dialog - Conditional: RE/MAX or Avaluz */}
          {isRemax ? (
            <TenantPdfPreviewDialog
              open={pdfPreviewOpen}
              onClose={() => setPdfPreviewOpen(false)}
              reportData={isRental ? rentalReportData : reportData}
              reportType={isRental ? 'aluguel' : 'venda'}
              companyName={tenant.brandName}
              documentTitle={`Avaliacao_${isRental ? 'Aluguel' : 'Venda'}_${tenant.brandName}_${currentEvaluationId}`}
            />
          ) : (
            <PdfPreviewDialog
              open={pdfPreviewOpen}
              onClose={() => setPdfPreviewOpen(false)}
              reportData={isRental ? rentalReportData : reportData}
              reportType={isRental ? 'aluguel' : 'venda'}
              documentTitle={`Avaliacao_${isRental ? 'Aluguel' : 'Venda'}_Avaluz_${currentEvaluationId}`}
            />
          )}

          {/* Presentation Mode */}
          {presentationOpen && (
            <PresentationMode
              open={presentationOpen}
              reportData={isRental ? rentalReportData : reportData}
              reportType={isRental ? 'aluguel' : 'venda'}
              onClose={() => setPresentationOpen(false)}
              isRemax={isRemax}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Editor Modal */}
      {pdfEditorOpen && (
        <PdfReportEditor
          data={isRental ? baseRentalReportData : baseReportData}
          onSave={handleSavePdfEdits}
          onCancel={handleCancelPdfEdit}
          isRental={isRental}
          evaluationId={currentEvaluationId}
        />
      )}
    </>
  )
}
