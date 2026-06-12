import { useRef, useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download, Loader2, X, ShoppingBag, Presentation } from 'lucide-react'
import { AvaluzBuyerReport } from '@/pages/Pdf/AvaluzBuyerReport'
import { BuyerPresentationMode } from './BuyerPresentationMode'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import type { BuscarImoveisFormData } from '@/validators/BuscarImoveis'

interface BuyerPdfPreviewDialogProps {
  open: boolean
  onClose: () => void
  properties: PropertyForDisplay[]
  searchCriteria: BuscarImoveisFormData
  broker?: {
    nome?: string | null
    email?: string | null
    creci?: string | null
    avatar_url?: string | null
    imobiliaria?: string | null
    telefone?: string | null
    logo_imobiliaria_url?: string | null
  } | null
}

export function BuyerPdfPreviewDialog({
  open,
  onClose,
  properties,
  searchCriteria,
  broker,
}: BuyerPdfPreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [scale, setScale] = useState(0.35)
  const [contentHeightPx, setContentHeightPx] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [presentationOpen, setPresentationOpen] = useState(false)

  const calculateScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const pdfWidthPx = 794
    const padding = 32
    const availableWidth = containerWidth - padding
    const newScale = Math.min(availableWidth / pdfWidthPx, 0.6)
    setScale(Math.max(newScale, 0.25))
  }, [])

  const measureContentHeight = useCallback(() => {
    const el = previewRef.current
    if (!el) return
    const h = el.scrollHeight
    if (h > 0) setContentHeightPx(h)
  }, [])

  useEffect(() => {
    if (!open) return
    setTimeout(calculateScale, 100)
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [open, calculateScale])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => measureContentHeight(), 80)
    const ro = new ResizeObserver(() => measureContentHeight())
    if (previewRef.current) ro.observe(previewRef.current)
    return () => {
      window.clearTimeout(t)
      ro.disconnect()
    }
  }, [open, measureContentHeight])

  const waitForImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img')
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
    })
    await Promise.race([
      Promise.all(imagePromises),
      new Promise<void>((resolve) => setTimeout(resolve, 10000)),
    ])
  }

  const waitForFonts = async (): Promise<void> => {
    try {
      await document.fonts.ready
      await Promise.all([
        document.fonts.load('400 16px Inter'),
        document.fonts.load('600 16px Inter'),
        document.fonts.load('700 16px Inter'),
      ])
    } catch (e) {
      console.warn('Erro ao carregar fontes:', e)
    }
  }

  const handleDownload = async () => {
    if (!captureRef.current || isGenerating) return

    setIsGenerating(true)
    document.body.classList.add('pdf-capture-mode')

    try {
      const element = captureRef.current
      await waitForFonts()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await new Promise<void>((resolve) => setTimeout(resolve, 100))

      const pdfWidth = 210
      const pdfHeight = 297

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      const isLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4
      const captureScale = isMobile || isLowMemory ? 1.5 : 2

      const pages = element.querySelectorAll<HTMLElement>('.page-break')

      if (pages.length === 0) {
        toast.error('Nenhuma página encontrada para gerar o PDF')
        setIsGenerating(false)
        return
      }

      setTotalPages(pages.length)
      setCurrentPage(0)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      let successfulPages = 0

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i]
        setCurrentPage(i + 1)

        try {
          pageEl.style.backgroundColor = '#0A1628'
          await waitForImages(pageEl)
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          await new Promise<void>((resolve) => setTimeout(resolve, 30))

          const canvas = await html2canvas(pageEl, {
            scale: captureScale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#0A1628',
            width: pageEl.offsetWidth,
            height: pageEl.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            imageTimeout: 8000,
            onclone: (clonedDoc, clonedEl) => {
              // Forçar visibilidade e posição no elemento clonado (corrige bug de tela preta)
              clonedEl.style.opacity = '1'
              clonedEl.style.visibility = 'visible'
              clonedEl.style.position = 'relative'
              clonedEl.style.left = '0'
              clonedEl.style.top = '0'
              clonedEl.style.backgroundColor = '#0A1628'
              
              // Forçar visibilidade em toda a árvore de ancestrais
              let parent = clonedEl.parentElement
              while (parent) {
                parent.style.opacity = '1'
                parent.style.visibility = 'visible'
                parent = parent.parentElement
              }
            },
          })

          if (canvas.width === 0 || canvas.height === 0) {
            console.warn(`Página ${i + 1} com dimensões inválidas, pulando...`)
            continue
          }

          const imgData = canvas.toDataURL('image/jpeg', 0.92)

          if (successfulPages > 0) {
            pdf.addPage()
          }

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
          successfulPages++
        } catch (pageError) {
          console.warn(`Erro ao capturar página ${i + 1}, pulando...`, pageError)
        }
      }

      if (successfulPages === 0) {
        toast.error('Não foi possível gerar nenhuma página do PDF')
        setIsGenerating(false)
        return
      }

      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

      if (isIOS) {
        window.location.href = blobUrl
        toast.success('PDF aberto! Toque no ícone de compartilhar para salvar.', {
          duration: 6000,
        })
      } else {
        const downloadLink = document.createElement('a')
        downloadLink.href = blobUrl
        downloadLink.download = `Imoveis-${searchCriteria.bairro}-${searchCriteria.municipio}.pdf`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        toast.success('PDF baixado com sucesso!')
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000)
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao gerar PDF:', errorMessage, error)
      toast.error(`Erro ao gerar PDF: ${errorMessage.slice(0, 50)}`)
    } finally {
      document.body.classList.remove('pdf-capture-mode')
      setIsGenerating(false)
      setCurrentPage(0)
      setTotalPages(0)
    }
  }

  if (properties.length === 0) return null

  const pdfWidthPx = 794
  const fallbackPageHeightPx = 1123
  const scaledWidth = pdfWidthPx * scale
  const scaledHeight = Math.max(1, Math.round((contentHeightPx || fallbackPageHeightPx) * scale))

  const reportData = {
    properties,
    searchCriteria,
    broker,
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden z-[60]">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <DialogTitle className="text-sm sm:text-base">
              Preview - Imóveis para Compra ({properties.length})
            </DialogTitle>
          </div>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex-1 min-h-0 bg-slate-900 overflow-y-auto overflow-x-hidden"
        >
          <div className="p-2 sm:p-4 flex justify-center overflow-hidden">
            <div
              style={{
                width: scaledWidth,
                maxWidth: '100%',
                height: scaledHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                ref={previewRef}
                style={{
                  width: pdfWidthPx,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  overflow: 'hidden',
                }}
              >
                <AvaluzBuyerReport {...reportData} />
              </div>
            </div>
          </div>
        </div>

        {/* Offscreen render for capture - posicionado fora da viewport mas com dimensões preservadas */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: '-200vh',
            width: '210mm',
            pointerEvents: 'none',
            zIndex: -9999,
            visibility: 'hidden',
          }}
        >
          <div ref={captureRef} style={{ 
            width: '210mm',
            visibility: 'visible',
          }}>
            <AvaluzBuyerReport {...reportData} />
          </div>
        </div>

        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-background flex flex-col gap-3">
          {isGenerating && totalPages > 0 && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Gerando página {currentPage} de {totalPages}...
                </span>
                <span>{Math.round((currentPage / totalPages) * 100)}%</span>
              </div>
              <Progress value={(currentPage / totalPages) * 100} className="h-2" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {isGenerating
                ? 'Aguarde enquanto o PDF é gerado...'
                : 'Role para visualizar todas as páginas'}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
                className="flex-1 sm:flex-none text-sm"
              >
                <X className="mr-1.5 sm:mr-2 h-4 w-4" />
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => setPresentationOpen(true)}
                disabled={isGenerating}
                className="flex-1 sm:flex-none text-sm"
              >
                <Presentation className="mr-1.5 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Apresentar</span>
                <span className="sm:hidden">Slide</span>
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 sm:flex-none text-sm bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 h-4 w-4 animate-spin" />
                    {totalPages > 0 ? `${currentPage}/${totalPages}` : 'Preparando...'}
                  </>
                ) : (
                  <>
                    <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
                    Baixar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <BuyerPresentationMode
          open={presentationOpen}
          onClose={() => setPresentationOpen(false)}
          properties={properties}
          searchCriteria={searchCriteria}
          broker={broker}
          onDownload={handleDownload}
        />
      </DialogContent>
    </Dialog>
  )
}
