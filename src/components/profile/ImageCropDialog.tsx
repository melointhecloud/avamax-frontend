import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react'

interface ImageCropDialogProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCrop: (blob: Blob) => void
  shape?: 'circle' | 'rounded-square'
  title?: string
  outputSize?: number
}

export const ImageCropDialog = ({
  open,
  onClose,
  imageSrc,
  onCrop,
  shape = 'circle',
  title = 'Ajustar imagem',
  outputSize = 512,
}: ImageCropDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 })
  const [cropping, setCropping] = useState(false)

  // Reset state when image changes
  useEffect(() => {
    if (open) {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setCropping(false)
    }
  }, [open, imageSrc])

  const CROP_SIZE = 240

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [offset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [dragging, dragStart])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleCrop = useCallback(async () => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return

    setCropping(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')!

      // Calculate the visible area in image coordinates
      const containerRect = container.getBoundingClientRect()
      const imgRect = img.getBoundingClientRect()

      // Circle center relative to the container
      const circleCenterX = containerRect.width / 2
      const circleCenterY = containerRect.height / 2
      const circleRadius = CROP_SIZE / 2

      // Circle bounds relative to the displayed image
      const cropLeft = circleCenterX - circleRadius - (imgRect.left - containerRect.left)
      const cropTop = circleCenterY - circleRadius - (imgRect.top - containerRect.top)
      const cropDisplaySize = CROP_SIZE

      // Scale from display coordinates to natural image coordinates
      const scaleX = img.naturalWidth / imgRect.width
      const scaleY = img.naturalHeight / imgRect.height

      const sx = cropLeft * scaleX
      const sy = cropTop * scaleY
      const sw = cropDisplaySize * scaleX
      const sh = cropDisplaySize * scaleY

      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
      } else {
        const r = outputSize * 0.08
        ctx.beginPath()
        ctx.roundRect(0, 0, outputSize, outputSize, r)
        ctx.closePath()
        ctx.clip()
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize)

      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob)
        }
        setCropping(false)
      }, 'image/png')
    } catch {
      setCropping(false)
    }
  }, [outputSize, shape, onCrop, CROP_SIZE])

  // Compute image display size to fill the crop area at minimum
  const getImageStyle = () => {
    if (!imgNatural.w || !imgNatural.h) return {}
    const aspect = imgNatural.w / imgNatural.h
    let displayW: number, displayH: number

    if (aspect > 1) {
      displayH = CROP_SIZE
      displayW = CROP_SIZE * aspect
    } else {
      displayW = CROP_SIZE
      displayH = CROP_SIZE / aspect
    }

    return {
      width: displayW * zoom,
      height: displayH * zoom,
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      cursor: dragging ? 'grabbing' : 'grab',
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Crop area */}
          <div
            ref={containerRef}
            className="relative flex items-center justify-center overflow-hidden bg-muted"
            style={{ width: CROP_SIZE + 40, height: CROP_SIZE + 40 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute select-none pointer-events-none"
              style={getImageStyle()}
            />

            {/* Overlay mask */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              viewBox={`0 0 ${CROP_SIZE + 40} ${CROP_SIZE + 40}`}
            >
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {shape === 'circle' ? (
                    <circle
                      cx={(CROP_SIZE + 40) / 2}
                      cy={(CROP_SIZE + 40) / 2}
                      r={CROP_SIZE / 2}
                      fill="black"
                    />
                  ) : (
                    <rect
                      x={20}
                      y={20}
                      width={CROP_SIZE}
                      height={CROP_SIZE}
                      rx={CROP_SIZE * 0.08}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="hsl(var(--background) / 0.7)"
                mask="url(#crop-mask)"
              />
              {shape === 'circle' ? (
                <circle
                  cx={(CROP_SIZE + 40) / 2}
                  cy={(CROP_SIZE + 40) / 2}
                  r={CROP_SIZE / 2}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              ) : (
                <rect
                  x={20}
                  y={20}
                  width={CROP_SIZE}
                  height={CROP_SIZE}
                  rx={CROP_SIZE * 0.08}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>

          {/* Zoom controls */}
          <div className="flex w-full items-center gap-3 px-4">
            <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={cropping} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleCrop} disabled={cropping} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            {cropping ? 'Recortando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
