import { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormSectionProps {
  title: string
  children: ReactNode
  onClear?: () => void
}

export const FormSection = ({ title, children, onClear }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        {title && (
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
        )}
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs">Limpar</span>
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}
