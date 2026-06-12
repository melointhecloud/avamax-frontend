import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Download, MapPin, Calendar, Ruler, Loader2, Home, Key, Trash2, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EvaluationCardProps {
  avaliacao: {
    id: number
    created_at: string
    author_name?: string
    input: {
      municipio?: string
      estado?: string
      bairro?: string
      categoria?: string
      area?: number
      areaTotal?: number
      tipoAvaliacao?: 'venda' | 'aluguel'
    }
    resultado: {
      valor_estimado?: number
      pdf_settings?: {
        market?: {
          valor_estimado?: number
        }
      }
      pdf_settings_aluguel?: {
        market?: {
          valor_estimado?: number
        }
      }
    }
  }
  onView: () => void
  onDownload: () => void
  onDelete: () => void
  formatCurrency: (value?: number) => string
  isDownloading?: boolean
  isDeleting?: boolean
  isRemax?: boolean
}

// Helper para obter valor estimado (editado ou original)
const getValorEstimado = (avaliacao: EvaluationCardProps['avaliacao']): number | undefined => {
  const isRental = avaliacao.input?.tipoAvaliacao === 'aluguel'
  const resultado = avaliacao.resultado
  
  if (isRental) {
    const valorEditadoAluguel = resultado?.pdf_settings_aluguel?.market?.valor_estimado
    if (valorEditadoAluguel) return valorEditadoAluguel
    
    const valorVenda = resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado
    return valorVenda ? Math.round(valorVenda * 0.005) : undefined
  } else {
    return resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado
  }
}

export const EvaluationCard = ({
  avaliacao,
  onView,
  onDownload,
  onDelete,
  formatCurrency,
  isDownloading = false,
  isDeleting = false,
  isRemax = false,
}: EvaluationCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Location & Category */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {avaliacao.input?.bairro || '-'}
              </p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {avaliacao.input?.municipio}, {avaliacao.input?.estado}
                </span>
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Badge 
                className={isRemax
                  ? 'gap-1 text-white border-transparent'
                  : avaliacao.input?.tipoAvaliacao === 'aluguel' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1' 
                    : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 gap-1'
                }
                style={isRemax ? { background: 'hsl(216 100% 40%)' } : undefined}
              >
                {avaliacao.input?.tipoAvaliacao === 'aluguel' ? (
                  <><Key className="h-3 w-3" /> Aluguel</>
                ) : (
                  <><Home className="h-3 w-3" /> Venda</>
                )}
              </Badge>
              <Badge variant="secondary">
                {avaliacao.input?.categoria || '-'}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {avaliacao.author_name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {avaliacao.author_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(avaliacao.created_at), 'dd MMM yyyy', { locale: ptBR })}
            </span>
            {avaliacao.input?.area && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {avaliacao.input.area} m²
              </span>
            )}
          </div>

          {/* Value & Actions */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {avaliacao.input?.tipoAvaliacao === 'aluguel' ? 'Aluguel estimado' : 'Valor estimado'}
              </p>
              <p className={`text-lg font-semibold ${avaliacao.input?.tipoAvaliacao === 'aluguel' ? 'text-emerald-600' : 'text-primary'}`}>
                {formatCurrency(getValorEstimado(avaliacao))}
                {avaliacao.input?.tipoAvaliacao === 'aluguel' && <span className="text-sm font-normal">/mês</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={onView}
                aria-label="Visualizar avaliação"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={onDownload}
                disabled={isDownloading}
                aria-label="Baixar PDF"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={onDelete}
                disabled={isDeleting}
                aria-label="Excluir avaliação"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
