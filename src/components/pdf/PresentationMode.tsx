import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2,
  Minimize2,
  Download,
  Monitor,
  Smartphone,
  RotateCcw,
  Zap,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { AvaluzReport } from '@/pages/Pdf'
import { AvaluzRentalReport } from '@/pages/Pdf/AvaluzRentalReport'
import { AvaluzReportLandscape } from '@/pages/Pdf/AvaluzReportLandscape'
import { AvaluzRentalReportLandscape } from '@/pages/Pdf/AvaluzRentalReportLandscape'
import { RemaxReport } from '@/pages/Pdf/RemaxReport'
import { RemaxReportLandscape } from '@/pages/Pdf/RemaxReportLandscape'
import { PdfThemeStyles } from '@/components/pdf/PdfThemeStyles'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

type PdfColors = {
  background: string
  backgroundGradientFrom: string
  backgroundGradientVia: string
  backgroundGradientTo: string
  primary: string
  primaryLight: string
  secondary: string
  secondaryLight: string
  accent: string
  text: string
  textMuted: string
  cardBackground: string
  cardBorder: string
}

const FALLBACK_SALE_COLORS: PdfColors = {
  background: '#0A1628',
  backgroundGradientFrom: '#061224',
  backgroundGradientVia: '#0A1E3C',
  backgroundGradientTo: '#0D2847',
  primary: '#f97316',
  primaryLight: '#fb923c',
  secondary: '#3b82f6',
  secondaryLight: '#60a5fa',
  accent: '#10b981',
  text: '#ffffff',
  textMuted: '#94a3b8',
  cardBackground: 'rgba(59, 130, 246, 0.1)',
  cardBorder: 'rgba(96, 165, 250, 0.2)',
}

const FALLBACK_RENTAL_COLORS: PdfColors = {
  ...FALLBACK_SALE_COLORS,
  primary: '#10b981',
  primaryLight: '#34d399',
}

// A4 dimensions - use CSS mm for consistency with templates
const A4_PORTRAIT_WIDTH_MM = 210
const A4_PORTRAIT_HEIGHT_MM = 297
const A4_LANDSCAPE_WIDTH_MM = 297
const A4_LANDSCAPE_HEIGHT_MM = 210

// CSS mm to px conversion (1mm = 3.7795275591px per W3C spec)
const MM_TO_PX = 3.7795275591

// Pixel equivalents for calculations
const A4_PORTRAIT_WIDTH = Math.round(A4_PORTRAIT_WIDTH_MM * MM_TO_PX)  // ~794px
const A4_PORTRAIT_HEIGHT = Math.round(A4_PORTRAIT_HEIGHT_MM * MM_TO_PX) // ~1123px
const A4_LANDSCAPE_WIDTH = Math.round(A4_LANDSCAPE_WIDTH_MM * MM_TO_PX) // ~1123px
const A4_LANDSCAPE_HEIGHT = Math.round(A4_LANDSCAPE_HEIGHT_MM * MM_TO_PX) // ~794px

type ViewMode = 'portrait' | 'landscape'
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv'

interface PresentationModeProps {
  open: boolean
  onClose: () => void
  reportData: any
  reportType: 'venda' | 'aluguel'
  onDownload?: () => void
  isRemax?: boolean
}

// Detect device type based on screen size and touch capability
const getDeviceType = (): DeviceType => {
  const width = window.screen.width
  const height = window.screen.height
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const aspectRatio = width / height
  
  // TVs and large monitors (typically 1920+ width or connected via HDMI)
  if (width >= 1920 || (width >= 1280 && !isTouchDevice && aspectRatio >= 1.5)) {
    return 'tv'
  }
  
  // Tablets (touch devices with medium to large screens)
  if (isTouchDevice && width >= 768) {
    return 'tablet'
  }
  
  // Mobile (small touch devices)
  if (isTouchDevice && width < 768) {
    return 'mobile'
  }
  
  return 'desktop'
}

export function PresentationMode({
  open,
  onClose,
  reportData,
  reportType,
  onDownload,
  isRemax = false,
}: PresentationModeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pagesContainerRef = useRef<HTMLDivElement>(null)
  const slideContainerRef = useRef<HTMLDivElement>(null)
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [scale, setScale] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('landscape')
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [showOrientationHint, setShowOrientationHint] = useState(false)
  const [orientationHintDismissed, setOrientationHintDismissed] = useState(false)
  const [remaxVariant, setRemaxVariant] = useState<'quick' | 'full'>('full')
  
  // Override reportData variant when isRemax
  const effectiveReportData = useMemo(() => {
    if (isRemax) {
      return { ...reportData, variant: remaxVariant }
    }
    return reportData
  }, [isRemax, reportData, remaxVariant])
  
  const isMobile = useIsMobile()
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageWidth = viewMode === 'landscape' ? A4_LANDSCAPE_WIDTH : A4_PORTRAIT_WIDTH
  const pageHeight = viewMode === 'landscape' ? A4_LANDSCAPE_HEIGHT : A4_PORTRAIT_HEIGHT
  const pageWidthMM = viewMode === 'landscape' ? A4_LANDSCAPE_WIDTH_MM : A4_PORTRAIT_WIDTH_MM
  const pageHeightMM = viewMode === 'landscape' ? A4_LANDSCAPE_HEIGHT_MM : A4_PORTRAIT_HEIGHT_MM

  // Check if we need fit-width mode (mobile + landscape PDF)
  const useFitWidthMode = deviceType === 'mobile' && viewMode === 'landscape'

  // Detect device type on mount and resize
  useEffect(() => {
    const updateDeviceType = () => {
      setDeviceType(getDeviceType())
    }
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  // Show orientation hint when mobile + landscape mode (but only once per session)
  useEffect(() => {
    if (deviceType === 'mobile' && viewMode === 'landscape' && !orientationHintDismissed) {
      setShowOrientationHint(true)
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowOrientationHint(false)
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShowOrientationHint(false)
    }
  }, [deviceType, viewMode, orientationHintDismissed])

  // Get device-specific configurations
  const deviceConfig = useMemo(() => {
    const isTouchDevice = deviceType === 'tablet' || deviceType === 'mobile'
    
    return {
      // Scale multiplier per device type
      scaleMultiplier: {
        'tv': 1.0,        // Use maximum space on TVs
        'tablet': 0.92,   // Margin for touch gestures
        'desktop': 0.95,
        'mobile': 0.95    // Better usage of available width
      }[deviceType],
      
      // Swipe threshold (larger for tablets)
      swipeThreshold: isTouchDevice ? 80 : 50,
      
      // Controls visibility timeout (longer for touch, always visible for mobile)
      controlsTimeout: deviceType === 'mobile' ? 999999 : isTouchDevice ? 5000 : 3000,
      
      // Button sizes (larger for TVs and tablets)
      buttonSize: {
        'tv': 'h-14 w-14',
        'tablet': 'h-12 w-12',
        'desktop': 'h-10 w-10',
        'mobile': 'h-9 w-9'
      }[deviceType],
      
      // Arrow icon sizes
      arrowSize: {
        'tv': 'h-10 w-10',
        'tablet': 'h-8 w-8',
        'desktop': 'h-6 w-6 sm:h-8 sm:w-8',
        'mobile': 'h-5 w-5'
      }[deviceType],
      
      // Counter text size
      counterSize: {
        'tv': 'text-lg',
        'tablet': 'text-base',
        'desktop': 'text-sm',
        'mobile': 'text-xs'
      }[deviceType],
      
      // Padding around slide
      slidePadding: {
        'tv': 'px-24 py-16',
        'tablet': 'px-16 py-12',
        'desktop': 'px-12 sm:px-20 py-20',
        'mobile': useFitWidthMode ? 'px-2 pt-2 pb-4' : 'px-3 py-6'
      }[deviceType],
      
      isTouchDevice
    }
  }, [deviceType, useFitWidthMode])

  // Calculate dynamic scale based on viewport and device
  const calculateScale = useCallback(() => {
    if (!slideContainerRef.current) return 1
    
    const containerWidth = slideContainerRef.current.clientWidth
    const containerHeight = slideContainerRef.current.clientHeight
    
    // Mobile + Landscape PDF: Use fit-width strategy with vertical scroll
    if (useFitWidthMode) {
      const padding = 16
      const availableWidth = containerWidth - padding
      const fitWidthScale = availableWidth / pageWidth
      return fitWidthScale * 0.98
    }
    
    // Dynamic padding based on device
    const padding = deviceType === 'tv' ? 60 : deviceType === 'tablet' ? 48 : deviceType === 'mobile' ? 24 : 40
    
    const availableWidth = containerWidth - padding
    const availableHeight = containerHeight - padding
    
    const scaleX = availableWidth / pageWidth
    const scaleY = availableHeight / pageHeight
    
    // Apply device-specific multiplier
    return Math.min(scaleX, scaleY) * deviceConfig.scaleMultiplier
  }, [pageWidth, pageHeight, deviceType, deviceConfig.scaleMultiplier, useFitWidthMode])

  // Update scale on resize or mode change
  useEffect(() => {
    if (!open) return
    
    const updateScale = () => {
      const newScale = calculateScale()
      setScale(newScale)
    }
    
    const timer = setTimeout(updateScale, 100)
    window.addEventListener('resize', updateScale)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateScale)
    }
  }, [open, calculateScale, viewMode])

  // Calculate PDF pages from rendered content
  useEffect(() => {
    if (!open) return
    
    const timer = setTimeout(() => {
      if (pagesContainerRef.current) {
        const pages = pagesContainerRef.current.querySelectorAll('.page-break')
        setTotalPages(pages.length)
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [open, reportData, viewMode, remaxVariant])

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setCurrentPageIndex(0)
      setControlsVisible(true)
      setSwipeOffset(0)
      setRemaxVariant('full')
    }
  }, [open])

  // Reset page index when variant changes
  useEffect(() => {
    setCurrentPageIndex(0)
  }, [remaxVariant])

  // Auto-hide controls with device-specific timeout (but not on mobile)
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true)
    
    // On mobile, controls are always visible
    if (deviceType === 'mobile') return
    
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
    }, deviceConfig.controlsTimeout)
  }, [deviceConfig.controlsTimeout, deviceType])

  useEffect(() => {
    if (open) {
      resetControlsTimer()
    }
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
    }
  }, [open, resetControlsTimer])

  // Navigation functions
  const goToPage = useCallback((index: number) => {
    setCurrentPageIndex(Math.max(0, Math.min(index, totalPages - 1)))
    resetControlsTimer()
  }, [totalPages, resetControlsTimer])

  const nextPage = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      goToPage(currentPageIndex + 1)
    }
  }, [currentPageIndex, totalPages, goToPage])

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1)
    }
  }, [currentPageIndex, goToPage])

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'portrait' ? 'landscape' : 'portrait')
    setCurrentPageIndex(0)
  }, [])

  // Dismiss orientation hint
  const dismissOrientationHint = useCallback(() => {
    setShowOrientationHint(false)
    setOrientationHintDismissed(true)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault()
          nextPage()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevPage()
          break
        case 'Escape':
          e.preventDefault()
          if (isFullscreen) {
            exitFullscreen()
          } else {
            onClose()
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleViewMode()
          break
        case 'v':
        case 'V':
          if (isRemax) {
            e.preventDefault()
            setRemaxVariant(prev => prev === 'quick' ? 'full' : 'quick')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, nextPage, prevPage, isFullscreen, onClose, toggleViewMode, isRemax])

  // Enhanced touch/swipe handling with visual feedback
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setSwipeOffset(0)
    resetControlsTimer()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX
    
    // Limit swipe offset for visual feedback
    const maxOffset = 100
    const offset = Math.max(-maxOffset, Math.min(maxOffset, diff * 0.3))
    setSwipeOffset(offset)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    
    // Use device-specific threshold
    if (Math.abs(diff) > deviceConfig.swipeThreshold) {
      if (diff > 0) {
        nextPage()
      } else {
        prevPage()
      }
    }
    
    setTouchStartX(null)
    setSwipeOffset(0)
  }

  // Fullscreen handling
  const enterFullscreen = async () => {
    try {
      const elem = containerRef.current
      if (!elem) return

      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen()
      }
      
      setIsFullscreen(true)
    } catch (err) {
      console.warn('Fullscreen not supported:', err)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      }
      setIsFullscreen(false)
    } catch (err) {
      console.warn('Exit fullscreen error:', err)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement
      setIsFullscreen(isFull)
      setTimeout(() => setScale(calculateScale()), 100)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [calculateScale])

  // Progress bar for TVs (more visible than dots)
  const renderProgressBar = useMemo(() => {
    if (totalPages <= 1) return null
    
    const progress = ((currentPageIndex + 1) / totalPages) * 100
    const isRental = reportType === 'aluguel'
    
    return (
      <div className="w-full max-w-md mx-auto">
        <div className={cn(
          "bg-white/10 rounded-full overflow-hidden",
          deviceType === 'mobile' ? "h-1" : "h-1.5"
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              isRental ? "bg-emerald-500" : "bg-orange-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }, [totalPages, currentPageIndex, reportType, deviceType])

  // Render dots indicator (for smaller screens)
  const renderDots = useMemo(() => {
    if (totalPages <= 1) return null
    
    const maxDots = deviceType === 'tv' ? 20 : deviceType === 'mobile' ? 8 : 15
    const showEllipsis = totalPages > maxDots
    const isRental = reportType === 'aluguel'
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, maxDots) }).map((_, i) => {
          const pageIndex = showEllipsis && i >= maxDots - 1 
            ? totalPages - 1 
            : i
          const isActive = pageIndex === currentPageIndex
          
          return (
            <button
              key={i}
              onClick={() => goToPage(pageIndex)}
              className={cn(
                "rounded-full transition-all duration-200",
                deviceType === 'tv' ? "w-3 h-3" : deviceType === 'mobile' ? "w-1.5 h-1.5" : "w-2 h-2",
                isActive 
                  ? cn(
                      deviceType === 'tv' ? "w-6" : deviceType === 'mobile' ? "w-3" : "w-4",
                      isRental ? "bg-emerald-500" : "bg-orange-500"
                    )
                  : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Ir para página ${pageIndex + 1}`}
            />
          )
        })}
      </div>
    )
  }, [totalPages, currentPageIndex, goToPage, reportType, deviceType])

  // Get the correct report component based on mode and type
  const ReportComponent = useMemo(() => {
    if (isRemax) {
      return viewMode === 'landscape' ? RemaxReportLandscape : RemaxReport
    }
    if (viewMode === 'landscape') {
      return reportType === 'aluguel' ? AvaluzRentalReportLandscape : AvaluzReportLandscape
    }
    return reportType === 'aluguel' ? AvaluzRentalReport : AvaluzReport
  }, [viewMode, reportType, isRemax])

  if (!open) return null

  const isRental = reportType === 'aluguel'
  const pdfColors: PdfColors =
    (reportData?.settings?.pdfColors as PdfColors | undefined) ??
    (isRental ? FALLBACK_RENTAL_COLORS : FALLBACK_SALE_COLORS)

  const accentColor = isRental ? 'emerald' : 'orange'
  const showProgressBar = deviceType === 'tv' || deviceType === 'mobile'

  // Mobile-specific computed values
  const isMobileDevice = deviceType === 'mobile'
  const mobileControlsAlwaysVisible = isMobileDevice || controlsVisible

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col pdf-theme"
        onMouseMove={resetControlsTimer}
        onClick={resetControlsTimer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Inject CSS overrides at root so .pdf-theme selectors apply to descendant PDFs */}
        <PdfThemeStyles colors={pdfColors} />
        {/* Orientation Hint Banner (Mobile + Landscape Mode) */}
        {showOrientationHint && (
          <div 
            className={cn(
              "absolute top-14 left-1/2 -translate-x-1/2 z-[60]",
              "bg-black/80 backdrop-blur-md border border-white/20 rounded-full",
              "px-4 py-2 flex items-center gap-2",
              "animate-in slide-in-from-top-2 fade-in duration-300"
            )}
            onClick={dismissOrientationHint}
          >
            <RotateCcw className="h-4 w-4 text-white/70 animate-pulse" />
            <span className="text-xs text-white/90">
              Gire o celular ou use <strong>Retrato</strong>
            </span>
            <button 
              onClick={dismissOrientationHint}
              className="ml-1 text-white/50 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Mobile Swipe Edge Indicators (always subtle) */}
        {isMobileDevice && (
          <>
            <div 
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-6 h-20 rounded-r-full transition-opacity duration-200 flex items-center justify-center",
                "bg-white/5 backdrop-blur-sm",
                currentPageIndex > 0 ? "opacity-60" : "opacity-0"
              )}
            >
              <ChevronLeft className="h-4 w-4 text-white/50" />
            </div>
            <div 
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 w-6 h-20 rounded-l-full transition-opacity duration-200 flex items-center justify-center",
                "bg-white/5 backdrop-blur-sm",
                currentPageIndex < totalPages - 1 ? "opacity-60" : "opacity-0"
              )}
            >
              <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </>
        )}

        {/* Non-mobile swipe indicators */}
        {deviceConfig.isTouchDevice && !isMobileDevice && (
          <>
            <div 
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-8 h-32 rounded-r-full transition-opacity duration-200 flex items-center justify-center",
                currentPageIndex > 0 ? "bg-white/5" : "opacity-0"
              )}
            >
              <ChevronLeft className="h-5 w-5 text-white/30" />
            </div>
            <div 
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 w-8 h-32 rounded-l-full transition-opacity duration-200 flex items-center justify-center",
                currentPageIndex < totalPages - 1 ? "bg-white/5" : "opacity-0"
              )}
            >
              <ChevronRight className="h-5 w-5 text-white/30" />
            </div>
          </>
        )}

        {/* Top Controls - Compact for Mobile */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 z-50 flex justify-between items-center transition-opacity duration-300",
            "bg-gradient-to-b from-black/70 to-transparent",
            isMobileDevice ? "p-2" : "p-4",
            mobileControlsAlwaysVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Left: Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "text-white hover:bg-white/20 backdrop-blur-sm",
              deviceConfig.buttonSize
            )}
          >
            <X className={isMobileDevice ? "h-4 w-4" : deviceType === 'tv' ? "h-7 w-7" : "h-5 w-5"} />
          </Button>

          {/* Center: View Mode Toggle (Mobile-optimized) */}
          <div className={cn(
            "flex items-center bg-black/50 backdrop-blur-md rounded-full border border-white/10",
            isMobileDevice ? "p-0.5" : "p-1"
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('portrait')}
                  className={cn(
                    "rounded-full transition-all flex items-center justify-center",
                    isMobileDevice ? "p-1.5" : "px-3 py-1.5",
                    viewMode === 'portrait' 
                      ? cn(
                          isRental ? "bg-emerald-500" : "bg-orange-500",
                          "text-white shadow-lg"
                        )
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Smartphone className={isMobileDevice ? "h-4 w-4" : "h-4 w-4"} />
                  {!isMobileDevice && <span className="ml-1.5 text-xs font-medium hidden sm:inline">Retrato</span>}
                </button>
              </TooltipTrigger>
              {isMobileDevice && <TooltipContent side="bottom">Modo Retrato</TooltipContent>}
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode('landscape')}
                  className={cn(
                    "rounded-full transition-all flex items-center justify-center",
                    isMobileDevice ? "p-1.5" : "px-3 py-1.5",
                    viewMode === 'landscape' 
                      ? cn(
                          isRental ? "bg-emerald-500" : "bg-orange-500",
                          "text-white shadow-lg"
                        )
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Monitor className={isMobileDevice ? "h-4 w-4" : "h-4 w-4"} />
                  {!isMobileDevice && <span className="ml-1.5 text-xs font-medium hidden sm:inline">Paisagem</span>}
                </button>
              </TooltipTrigger>
              {isMobileDevice && <TooltipContent side="bottom">Modo Paisagem</TooltipContent>}
            </Tooltip>
          </div>

          {/* RE/MAX Variant Toggle */}
          {isRemax && (
            <div className={cn(
              "flex items-center bg-black/50 backdrop-blur-md rounded-full border border-white/10",
              isMobileDevice ? "p-0.5" : "p-1"
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRemaxVariant('quick')}
                    className={cn(
                      "rounded-full transition-all flex items-center justify-center",
                      isMobileDevice ? "p-1.5" : "px-3 py-1.5",
                      remaxVariant === 'quick'
                        ? "text-white shadow-lg"
                        : "text-white/60 hover:text-white"
                    )}
                    style={remaxVariant === 'quick' ? { backgroundColor: '#CC0000' } : undefined}
                  >
                    <Zap className="h-4 w-4" />
                    {!isMobileDevice && <span className="ml-1.5 text-xs font-medium hidden sm:inline">Rápida</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Versão Rápida (V)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRemaxVariant('full')}
                    className={cn(
                      "rounded-full transition-all flex items-center justify-center",
                      isMobileDevice ? "p-1.5" : "px-3 py-1.5",
                      remaxVariant === 'full'
                        ? "text-white shadow-lg"
                        : "text-white/60 hover:text-white"
                    )}
                    style={remaxVariant === 'full' ? { backgroundColor: '#003DA5' } : undefined}
                  >
                    <FileText className="h-4 w-4" />
                    {!isMobileDevice && <span className="ml-1.5 text-xs font-medium hidden sm:inline">Completa</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Versão Completa (V)</TooltipContent>
              </Tooltip>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Fullscreen (not on mobile) */}
            {!isMobileDevice && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className={cn("text-white hover:bg-white/20 backdrop-blur-sm", deviceConfig.buttonSize)}
                title={isFullscreen ? 'Sair Tela Cheia (F)' : 'Tela Cheia (F)'}
              >
                {isFullscreen 
                  ? <Minimize2 className={deviceType === 'tv' ? "h-7 w-7" : "h-5 w-5"} /> 
                  : <Maximize2 className={deviceType === 'tv' ? "h-7 w-7" : "h-5 w-5"} />
                }
              </Button>
            )}

            {/* Download */}
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
                className={cn("text-white hover:bg-white/20 backdrop-blur-sm", deviceConfig.buttonSize)}
                title="Baixar PDF"
              >
                <Download className={isMobileDevice ? "h-4 w-4" : deviceType === 'tv' ? "h-7 w-7" : "h-5 w-5"} />
              </Button>
            )}
          </div>
        </div>

        {/* Main Slide Area */}
        <div 
          ref={slideContainerRef}
          className={cn(
            "flex-1 flex items-center justify-center",
            useFitWidthMode ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden",
            deviceConfig.slidePadding
          )}
        >
          {/* Navigation Arrow Left (not on mobile - use swipe) */}
          {!isMobileDevice && (
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className={cn(
                "absolute z-40 rounded-full transition-all duration-300",
                "bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed",
                "border border-white/10",
                deviceType === 'tv' ? "left-6 p-4" : "left-2 sm:left-4 p-2 sm:p-3",
                mobileControlsAlwaysVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Página anterior"
            >
              <ChevronLeft className={cn("text-white", deviceConfig.arrowSize)} />
            </button>
          )}

          {/* Offscreen render for page count */}
          <div 
            ref={pagesContainerRef}
            className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none"
            style={{ width: `${pageWidthMM}mm` }}
            aria-hidden="true"
          >
            <ReportComponent {...effectiveReportData} />
          </div>

          {/* Visible Content with Dynamic Scaling and Swipe Feedback */}
          <div 
            className={cn(
              "relative transition-all duration-300 ease-out flex-shrink-0",
            )}
            style={{
              width: `${pageWidthMM}mm`,
              height: useFitWidthMode ? 'auto' : `${pageHeightMM}mm`,
              minHeight: useFitWidthMode ? `${pageHeightMM}mm` : undefined,
              transform: `scale(${scale}) translateX(${swipeOffset}px)`,
              transformOrigin: useFitWidthMode ? 'top center' : 'center center',
            }}
          >
            <div 
              className={cn(
                isMobileDevice ? "rounded-md" : deviceType === 'tv' ? "rounded-xl" : "rounded-lg"
              )}
              style={{
                width: `${pageWidthMM}mm`,
                height: `${pageHeightMM}mm`,
                overflow: 'hidden',
                backgroundColor: '#0A1628', // fallback only, actual color comes from PDF template
                boxShadow: `0 25px 80px -20px rgba(${isRental ? '16, 185, 129' : '249, 115, 22'}, 0.4), 0 0 0 1px rgba(255,255,255,0.1)`
              }}
            >
              <div 
                className="presentation-pages-wrapper" 
                style={{ 
                  width: `${pageWidthMM}mm`,
                  height: `${pageHeightMM}mm`,
                }}
              >
                <ReportComponent {...effectiveReportData} />
              </div>
              
              <style>{`
                .presentation-pages-wrapper .page-break {
                  display: none !important;
                }
                /* Use nth-of-type so injected <style> nodes (PdfThemeStyles) don't break index 1 */
                .presentation-pages-wrapper .page-break:nth-of-type(${currentPageIndex + 1}) {
                  display: block !important;
                }
              `}</style>
            </div>
          </div>

          {/* Navigation Arrow Right (not on mobile - use swipe) */}
          {!isMobileDevice && (
            <button
              onClick={nextPage}
              disabled={currentPageIndex >= totalPages - 1}
              className={cn(
                "absolute z-40 rounded-full transition-all duration-300",
                "bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed",
                "border border-white/10",
                deviceType === 'tv' ? "right-6 p-4" : "right-2 sm:right-4 p-2 sm:p-3",
                mobileControlsAlwaysVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Próxima página"
            >
              <ChevronRight className={cn("text-white", deviceConfig.arrowSize)} />
            </button>
          )}
        </div>

        {/* Bottom Controls - Compact for Mobile */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center transition-opacity duration-300",
            "bg-gradient-to-t from-black/70 to-transparent",
            isMobileDevice ? "gap-1.5 p-3" : deviceType === 'tv' ? "gap-3 p-8" : "gap-3 p-4 sm:p-6",
            mobileControlsAlwaysVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Progress indicator (bar for TVs and mobile, dots for others) */}
          <div className={isMobileDevice ? "w-full px-4" : ""}>
            {showProgressBar ? renderProgressBar : renderDots}
          </div>

          {/* Page Counter */}
          <div className={cn(
            "text-white/70",
            deviceConfig.counterSize,
            isMobileDevice && "flex items-center gap-1"
          )}>
            {isMobileDevice ? (
              <>
                <span className={cn(
                  "font-bold",
                  isRental ? "text-emerald-400" : "text-orange-400"
                )}>{currentPageIndex + 1}</span>
                <span className="text-white/40">/</span>
                <span>{totalPages || '...'}</span>
              </>
            ) : (
              <>
                Página{' '}
                <span className={cn(
                  "font-semibold",
                  isRental ? "text-emerald-400" : "text-orange-400"
                )}>{currentPageIndex + 1}</span> de {totalPages || '...'}
              </>
            )}
          </div>

          {/* Keyboard hints (desktop/TV only) */}
          {!isMobileDevice && (
            <div className={cn(
              "hidden sm:flex items-center gap-4 text-white/40",
              deviceType === 'tv' ? "text-sm" : "text-xs"
            )}>
              <span>← → Navegar</span>
              <span>M Alternar modo</span>
              {isRemax && <span>V Alternar versão</span>}
              <span>F Tela cheia</span>
              <span>ESC Sair</span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
