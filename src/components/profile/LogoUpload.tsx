import { useRef, useState } from 'react'
import { Building2, Camera, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadLogo, useDeleteLogo } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import { ImageCropDialog } from './ImageCropDialog'

interface LogoUploadProps {
  currentUrl?: string | null
  imobiliaria?: string | null
  onUploadComplete?: (url: string) => void
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export const LogoUpload = ({ 
  currentUrl, 
  imobiliaria, 
  onUploadComplete 
}: LogoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const uploadMutation = useUploadLogo()
  const deleteMutation = useDeleteLogo()

  const isLoading = uploadMutation.isPending || deleteMutation.isPending

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Formato não suportado. Use PNG, JPG ou WEBP.')
      return
    }

    if (file.size > MAX_SIZE) {
      alert('Arquivo muito grande. Máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setCropSrc(ev.target?.result as string)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  const handleCropComplete = async (blob: Blob) => {
    setCropOpen(false)
    const previewUrl = URL.createObjectURL(blob)
    setPreview(previewUrl)

    const file = new File([blob], 'logo.png', { type: 'image/png' })
    try {
      const url = await uploadMutation.mutateAsync(file)
      onUploadComplete?.(url)
    } catch {
      setPreview(null)
    }
  }

  const handleDelete = async () => {
    setPreview(null)
    await deleteMutation.mutateAsync()
  }

  const displayUrl = preview || currentUrl

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold overflow-hidden ring-2 ring-border'
          )}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Logo da imobiliária"
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6" />
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Logo da imobiliária (opcional)</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="h-8"
          >
            <Camera className="mr-2 h-3 w-3" />
            {currentUrl ? 'Trocar' : 'Adicionar'}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropDialog
          open={cropOpen}
          onClose={() => setCropOpen(false)}
          imageSrc={cropSrc}
          onCrop={handleCropComplete}
          shape="circle"
          title="Ajustar logo da imobiliária"
        />
      )}
    </div>
  )
}
