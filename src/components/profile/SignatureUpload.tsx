import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { PenLine, Upload, Trash2, RotateCcw, Check, Loader2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useUploadSignature, useDeleteSignature } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

interface SignatureUploadProps {
  currentUrl?: string | null
}

export const SignatureUpload = ({ currentUrl }: SignatureUploadProps) => {
  const canvasRef = useRef<SignatureCanvas>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw')
  const [hasDrawn, setHasDrawn] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  
  const uploadMutation = useUploadSignature()
  const deleteMutation = useDeleteSignature()
  const isLoading = uploadMutation.isPending || deleteMutation.isPending

  // Cor do traço: sempre preto (fundo branco em ambos os modos)
  const penColor = '#1a1a2e'
  // Fundo do canvas: sempre branco para contraste
  const canvasBg = '#ffffff'

  const trimCanvas = (source: HTMLCanvasElement) => {
    const ctx = source.getContext('2d')
    if (!ctx) return source

    const { width, height } = source
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    let top = height
    let left = width
    let right = 0
    let bottom = 0

    // encontra bounding box de pixels não transparentes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const alpha = data[idx + 3]
        if (alpha > 0) {
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
    }

    // se vazio, retorna original
    if (left > right || top > bottom) return source

    const pad = 12
    left = Math.max(0, left - pad)
    top = Math.max(0, top - pad)
    right = Math.min(width - 1, right + pad)
    bottom = Math.min(height - 1, bottom + pad)

    const outW = right - left + 1
    const outH = bottom - top + 1

    const out = document.createElement('canvas')
    out.width = outW
    out.height = outH
    const outCtx = out.getContext('2d')
    if (!outCtx) return source
    outCtx.drawImage(source, left, top, outW, outH, 0, 0, outW, outH)
    return out
  }

  // Limpar canvas
  const handleClear = () => {
    canvasRef.current?.clear()
    setHasDrawn(false)
  }

  // Salvar assinatura do canvas
  const handleSaveCanvas = async () => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      toast.error('Desenhe sua assinatura primeiro')
      return
    }

    const baseCanvas = canvasRef.current.getCanvas()
    const trimmedCanvas = trimCanvas(baseCanvas)
    
    // Converter para blob PNG com transparência
    const blob: Blob | null = await new Promise((resolve) => {
      trimmedCanvas.toBlob((b) => resolve(b), 'image/png')
    })

    // Fallback (alguns navegadores podem retornar null)
    const finalBlob = blob ?? (await fetch(trimmedCanvas.toDataURL('image/png')).then((r) => r.blob()))

    await uploadMutation.mutateAsync(finalBlob)
    handleClear()
    setIsEditing(false)
  }

  // Upload de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Use PNG, JPG ou WEBP')
      return
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Máximo 1MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    await uploadMutation.mutateAsync(file)
    setPreview(null)
    setIsEditing(false)
    
    // Limpar input para permitir reselecionar o mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remover assinatura
  const handleDelete = async () => {
    await deleteMutation.mutateAsync()
    setPreview(null)
    setIsEditing(false)
  }

  const displayUrl = preview || currentUrl
  const hasSignature = !!displayUrl

  // Se já tem assinatura e não está editando, mostra layout compacto
  if (hasSignature && !isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Assinatura Digital</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sua assinatura aparecerá nos relatórios
            </p>
          </div>
        </div>

        {/* Preview da assinatura com ações */}
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-1 h-14 flex items-center justify-center rounded bg-muted/50">
            <img 
              src={displayUrl} 
              alt="Assinatura" 
              className="max-h-12 max-w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1.5" />
              Alterar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 mr-1.5" />
              )}
              Remover
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Modo de edição ou sem assinatura
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Assinatura Digital</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasSignature ? 'Altere sua assinatura' : 'Sua assinatura aparecerá nos relatórios de avaliação'}
          </p>
        </div>
        {hasSignature && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="text-muted-foreground"
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Tabs: Desenhar / Upload */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'draw' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw" className="gap-2">
            <PenLine className="h-4 w-4" />
            Desenhar
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* Aba Desenhar */}
        <TabsContent value="draw" className="mt-4">
          <div className="space-y-3">
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg overflow-hidden",
                "touch-none" // Prevenir scroll ao desenhar no mobile
              )}
              style={{ backgroundColor: canvasBg }}
            >
              <SignatureCanvas
                ref={canvasRef}
                penColor={penColor}
                backgroundColor={canvasBg}
                canvasProps={{
                  className: 'w-full h-32 cursor-crosshair',
                  style: { width: '100%', height: '128px', touchAction: 'none' }
                }}
                onBegin={() => setHasDrawn(true)}
                onEnd={() => setHasDrawn(!(canvasRef.current?.isEmpty() ?? true))}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Desenhe sua assinatura acima usando o mouse ou toque
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isLoading}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCanvas}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Aba Upload */}
        <TabsContent value="upload" className="mt-4">
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para selecionar imagem
                  </span>
                </div>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              PNG com fundo transparente recomendado • Máx 1MB
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
