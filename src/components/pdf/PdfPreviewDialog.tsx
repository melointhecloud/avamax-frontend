import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, Key, Home, Presentation } from 'lucide-react'

import { AvaluzReport } from '@/pages/Pdf'
import { AvaluzRentalReport } from '@/pages/Pdf/AvaluzRentalReport'
import { PresentationMode } from './PresentationMode'
import { PdfPreviewThemeBar } from './PdfPreviewThemeBar'
import { type PrintThemePreset } from './printThemePresets'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

interface PdfPreviewDialogProps {
  open: boolean
  onClose: () => void
  reportData: any
  reportType: 'venda' | 'aluguel'
  documentTitle: string
}

const MONOCHROME_STYLES = `
.pdf-monochrome [class*="shadow-"] { box-shadow: none !important; }
.pdf-monochrome [class*="blur-"] { filter: none !important; opacity: 0 !important; }
`

export function PdfPreviewDialog({
  open,
  onClose,
  reportData,
  reportType,
  documentTitle,
}: PdfPreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.35)
  const [contentHeightPx, setContentHeightPx] = useState(0)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<PrintThemePreset>({ id: 'original', label: 'Original', primary: '', secondary: '', background: '' })

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Build effective report data with theme override
  const effectiveReportData = useMemo(() => {
    if (selectedTheme.id === 'original') return reportData
    return {
      ...reportData,
      settings: {
        ...(reportData?.settings || {}),
        pdfColors: {
          primary: selectedTheme.primary,
          secondary: selectedTheme.secondary,
          background: selectedTheme.background,
        },
      },
    }
  }, [reportData, selectedTheme])

  const isMonochrome = selectedTheme.isMonochrome === true

  // Calculate responsive scale based on container width
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const pdfWidthPx = 794
    const padding = 32
    const availableWidth = containerWidth - padding
    const newScale = Math.min(availableWidth / pdfWidthPx, 0.6)
    setScale(Math.max(newScale, 0.25))
  }, [])

  // Measure the real (unscaled) height of the rendered PDF
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
  }, [open, measureContentHeight, reportType])

  // Re-measure when theme changes
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => measureContentHeight(), 150)
    return () => window.clearTimeout(t)
  }, [selectedTheme, open, measureContentHeight])

  if (!reportData) return null

  const isRental = reportType === 'aluguel'

  const pdfWidthPx = 794
  const fallbackPageHeightPx = 1123
  const scaledWidth = pdfWidthPx * scale
  const scaledHeight = Math.max(1, Math.round((contentHeightPx || fallbackPageHeightPx) * scale))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Monochrome CSS injection */}
        {isMonochrome && <style>{MONOCHROME_STYLES}</style>}

        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRental ? (
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              ) : (
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              )}
              <DialogTitle className="text-sm sm:text-base">
                Preview do PDF - {isRental ? 'Aluguel' : 'Venda'}
              </DialogTitle>
            </div>
          </div>
          {/* Theme bar */}
          <PdfPreviewThemeBar
            selected={selectedTheme.id}
            onSelect={setSelectedTheme}
          />
        </DialogHeader>

        {/* Scrollable Preview Content */}
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
                className={isMonochrome ? 'pdf-monochrome' : ''}
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
                {isRental ? (
                  <AvaluzRentalReport {...effectiveReportData} />
                ) : (
                  <AvaluzReport {...effectiveReportData} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-background flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Role para visualizar todas as páginas
            </p>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none text-sm">
                <X className="mr-1.5 sm:mr-2 h-4 w-4" />
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => setPresentationOpen(true)}
                className="flex-1 sm:flex-none text-sm"
              >
                <Presentation className="mr-1.5 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Apresentar</span>
                <span className="sm:hidden">Slide</span>
              </Button>

              <div className="flex flex-col items-end gap-1">
                <Button
                  onClick={() => {
                    queryClient.setQueryData(['avaluz_print_data'], {
                      data: effectiveReportData,
                      type: reportType
                    });
                    navigate('/print-preview');
                  }}
                  className={`flex-1 sm:flex-none text-sm ${isRental
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                >
                  <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">Baixar PDF Completo</span>
                  <span className="lg:hidden">Baixar</span>
                </Button>
                <span className="text-[10px] text-muted-foreground text-right max-w-[200px] leading-tight hidden sm:block">
                  Selecione <strong>"Salvar como PDF"</strong> na janela de impressão para salvar a análise.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Presentation Mode */}
        <PresentationMode
          open={presentationOpen}
          onClose={() => setPresentationOpen(false)}
          reportData={effectiveReportData}
          reportType={reportType}
          onDownload={() => setPresentationOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
