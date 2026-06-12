import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, Presentation, Zap, FileText, Sun, Moon } from 'lucide-react'

import { RemaxReport } from '@/pages/Pdf/RemaxReport'
import { PresentationMode } from './PresentationMode'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/contexts/TenantContext'

interface TenantPdfPreviewDialogProps {
  open: boolean
  onClose: () => void
  reportData: any
  reportType: 'venda' | 'aluguel'
  documentTitle: string
  /** Brand name shown in the dialog title. Defaults to the active tenant. */
  companyName?: string
  /** Brand accent color for the variant toggle / download button. */
  primaryColor?: string
  /** Brand secondary/quick-variant color. */
  accentColor?: string
  /** Brand logo URL (public asset path). Defaults to the active tenant logo. */
  logoUrl?: string
}

/**
 * Parametrizable PDF preview dialog. Generalizes RemaxPdfPreviewDialog:
 * the hardcoded "AvaMax — Estudo de Mercado" title and #003DA5 / #CC0000 colors
 * become props (with tenant-derived defaults), so a single component serves any
 * white-label brand.
 */
export function TenantPdfPreviewDialog({
  open,
  onClose,
  reportData,
  reportType,
  // documentTitle is part of the public API (used by the print flow / callers)
  // but not rendered here, matching the original RemaxPdfPreviewDialog contract.
  companyName,
  primaryColor,
  accentColor = '#CC0000',
  logoUrl,
}: TenantPdfPreviewDialogProps) {
  const tenant = useTenant()
  const brandName = companyName ?? tenant.brandName
  const brandPrimary = primaryColor ?? tenant.cssVars['--tenant-primary'] ?? '#003DA5'
  const brandLogo = logoUrl ?? tenant.assets.brandLogo

  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.35)
  const [contentHeightPx, setContentHeightPx] = useState(0)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [variant, setVariant] = useState<'quick' | 'full'>('full')
  const [darkMode, setDarkMode] = useState(false)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const effectiveReportData = useMemo(() => {
    if (!reportData) return null
    return { ...reportData, variant, darkMode }
  }, [reportData, variant, darkMode])

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
    return () => { window.clearTimeout(t); ro.disconnect() }
  }, [open, measureContentHeight, reportType])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => measureContentHeight(), 150)
    return () => window.clearTimeout(t)
  }, [variant, open, measureContentHeight])

  if (!reportData) return null

  const pdfWidthPx = 794
  const fallbackPageHeightPx = 1123
  const scaledWidth = pdfWidthPx * scale
  const scaledHeight = Math.max(1, Math.round((contentHeightPx || fallbackPageHeightPx) * scale))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="h-5 w-5 rounded object-contain" />
              ) : (
                <div className="w-5 h-5 rounded" style={{ backgroundColor: accentColor }} />
              )}
              <DialogTitle className="text-sm sm:text-base">
                {brandName} — Estudo de Mercado
              </DialogTitle>
            </div>
          </div>
          {/* Variant Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={variant === 'quick' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('quick')}
              className="text-xs gap-1.5"
              style={variant === 'quick' ? { backgroundColor: accentColor } : {}}
            >
              <Zap className="h-3 w-3" /> Versão Rápida
            </Button>
            <Button
              variant={variant === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('full')}
              className="text-xs gap-1.5"
              style={variant === 'full' ? { backgroundColor: brandPrimary } : {}}
            >
              <FileText className="h-3 w-3" /> Versão Completa
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="text-xs gap-1.5"
              style={darkMode ? { backgroundColor: brandPrimary, color: '#fff', borderColor: brandPrimary } : {}}
            >
              {darkMode ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {darkMode ? 'Escuro' : 'Claro'}
            </Button>
            <span className="text-[10px] text-muted-foreground ml-2">
              {variant === 'quick' ? '~30min de apresentação' : 'Todas as seções'}
            </span>
          </div>
        </DialogHeader>

        {/* Scrollable Preview */}
        <div ref={containerRef} className="flex-1 min-h-0 bg-slate-100 overflow-y-auto overflow-x-hidden">
          <div className="p-2 sm:p-4 flex justify-center overflow-hidden">
            <div style={{ width: scaledWidth, maxWidth: '100%', height: scaledHeight, overflow: 'hidden', position: 'relative' }}>
              <div
                ref={previewRef}
                style={{
                  width: pdfWidthPx,
                  position: 'absolute',
                  top: 0, left: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  overflow: 'hidden',
                }}
              >
                <RemaxReport {...effectiveReportData} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-background flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Role para visualizar todas as páginas
            </p>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none text-sm">
                <X className="mr-1.5 h-4 w-4" /> Fechar
              </Button>
              <Button variant="outline" onClick={() => setPresentationOpen(true)} className="flex-1 sm:flex-none text-sm">
                <Presentation className="mr-1.5 h-4 w-4" /> Apresentar
              </Button>
              <div className="flex flex-col items-end gap-1">
                <Button
                  onClick={() => {
                    queryClient.setQueryData(['avaluz_print_data'], {
                      data: effectiveReportData,
                      type: `remax-${reportType}`
                    });
                    navigate('/print-preview');
                  }}
                  className="flex-1 sm:flex-none text-sm text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  <span className="hidden lg:inline">Baixar PDF Completo</span>
                  <span className="lg:hidden">Baixar</span>
                </Button>
                <span className="text-[10px] text-muted-foreground text-right max-w-[200px] leading-tight hidden sm:block">
                  Selecione <strong>"Salvar como PDF"</strong> na janela de impressão.
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
          isRemax
        />
      </DialogContent>
    </Dialog>
  )
}
