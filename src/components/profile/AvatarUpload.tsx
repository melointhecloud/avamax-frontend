import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadAvatar, useDeleteAvatar } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import { ImageCropDialog } from './ImageCropDialog'

interface AvatarUploadProps {
  currentUrl?: string | null
  name?: string | null
  email?: string | null
  size?: 'sm' | 'md' | 'lg'
  onUploadComplete?: (url: string) => void
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export const AvatarUpload = ({ 
  currentUrl, 
  name, 
  email, 
  size = 'lg',
  onUploadComplete 
}: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const uploadMutation = useUploadAvatar()
  const deleteMutation = useDeleteAvatar()

  const isLoading = uploadMutation.isPending || deleteMutation.isPending

  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-lg',
    lg: 'h-24 w-24 text-2xl'
  }

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

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleCropComplete = async (blob: Blob) => {
    setCropOpen(false)
    const previewUrl = URL.createObjectURL(blob)
    setPreview(previewUrl)

    const file = new File([blob], 'avatar.png', { type: 'image/png' })
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold overflow-hidden ring-2 ring-border',
            sizeClasses[size]
          )}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials()
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        {size === 'lg' && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {size === 'lg' && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            <Camera className="mr-2 h-4 w-4" />
            {currentUrl ? 'Trocar foto' : 'Adicionar foto'}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {cropSrc && (
        <ImageCropDialog
          open={cropOpen}
          onClose={() => setCropOpen(false)}
          imageSrc={cropSrc}
          onCrop={handleCropComplete}
          shape="circle"
          title="Ajustar foto de perfil"
        />
      )}
    </div>
  )
}
