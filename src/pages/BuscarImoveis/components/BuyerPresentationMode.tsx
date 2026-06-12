import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { AvaluzBuyerReportLandscape } from '@/pages/Pdf/AvaluzBuyerReportLandscape'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import type { BuscarImoveisFormData } from '@/validators/BuscarImoveis'

interface BuyerPresentationModeProps {
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
  onDownload?: () => void
}

// A4 Landscape dimensions in mm
const A4_LANDSCAPE_WIDTH_MM = 297
const A4_LANDSCAPE_HEIGHT_MM = 210
const MM_TO_PX = 3.7795275591

export function BuyerPresentationMode({
  open,
  onClose,
  properties,
  searchCriteria,
  broker,
  onDownload,
}: BuyerPresentationModeProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(1)

  // Calculate pages based on content
  // 0: Cover, 1: Methodology, 2-N: Comparative table pages, N+1 to N+6: Individual samples,
  // Then: Diagnosis, Acquisition Intro, Acquisition Process, Last: Conclusion
  useEffect(() => {
    const tablePages = Math.ceil(properties.length / 6)
    const samplePages = Math.min(properties.length, 6)
    // Cover + Methodology + TablePages + SamplePages + Diagnosis + Acquisition Intro + Acquisition Process + Conclusion
    const total = 1 + 1 + tablePages + samplePages + 1 + 1 + 1 + 1
    setTotalPages(total)
  }, [properties])

  // Calculate scale to fit viewport
  const calculateScale = useCallback(() => {
    const viewportWidth = window.innerWidth * 0.95
    const viewportHeight = window.innerHeight * 0.85
    const pageWidthPx = A4_LANDSCAPE_WIDTH_MM * MM_TO_PX
    const pageHeightPx = A4_LANDSCAPE_HEIGHT_MM * MM_TO_PX
    const scaleX = viewportWidth / pageWidthPx
    const scaleY = viewportHeight / pageHeightPx
    setScale(Math.min(scaleX, scaleY, 1))
  }, [])

  useEffect(() => {
    if (open) {
      calculateScale()
      window.addEventListener('resize', calculateScale)
      return () => window.removeEventListener('resize', calculateScale)
    }
  }, [open, calculateScale])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentPage((p) => Math.max(p - 1, 0))
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, totalPages, onClose])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.warn('Fullscreen not supported:', err)
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }

  if (!open) return null

  const reportData = {
    properties,
    searchCriteria,
    broker,
    currentSlide: currentPage,
    settings: {
      showAcquisitionPlan: true,
      acquisitionPlan: {
        introduction: { enabled: true },
        process: { enabled: true },
      },
      showBrokerContact: true,
    },
  }

  const pageWidthPx = A4_LANDSCAPE_WIDTH_MM * MM_TO_PX
  const pageHeightPx = A4_LANDSCAPE_HEIGHT_MM * MM_TO_PX

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-slate-950 border-0 rounded-none">
        {/* Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="text-white/80 text-sm">
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex items-center justify-center h-full"
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            const clickX = e.clientX - rect.left
            if (clickX < rect.width / 2) {
              goToPage(currentPage - 1)
            } else {
              goToPage(currentPage + 1)
            }
          }}
        >
          {/* Page Container */}
          <div
            style={{
              width: `${A4_LANDSCAPE_WIDTH_MM}mm`,
              height: `${A4_LANDSCAPE_HEIGHT_MM}mm`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
            className="bg-[#0A1628] rounded-lg shadow-2xl overflow-hidden"
          >
            <AvaluzBuyerReportLandscape {...reportData} />
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Page Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentPage
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
