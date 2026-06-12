import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const ImageUpload = ({ 
  images, 
  onChange, 
  maxFiles = 5,
  maxSizeMB = 5 
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) return false
      if (file.size > maxSizeMB * 1024 * 1024) return false
      return true
    })

    const newImages = [...images, ...validFiles].slice(0, maxFiles)
    onChange(newImages)
  }, [images, onChange, maxFiles, maxSizeMB])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">Imagem do imóvel avaliado</h3>
        <Badge variant="destructive" className="text-xs">Campos obrigatórios</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Tire uma foto com o ambiente limpo e iluminado
      </p>

      <div className="space-y-2">
        <Label>Foto do imóvel <span className="text-destructive">*</span></Label>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('image-upload')?.click()}
          className={cn(
            "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isDragging 
              ? "border-accent bg-accent/5" 
              : "border-muted-foreground/25 hover:border-accent hover:bg-muted/50"
          )}
        >
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="rounded-lg bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Arraste arquivos ou clique para selecionar
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tipos aceitos: imagens JPG, PNG, WEBP (máximo {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Faça upload da(s) foto(s) do imóvel
        </p>
      </div>

      {/* Preview das imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((file, index) => (
            <div 
              key={index} 
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="truncate text-xs text-white">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
