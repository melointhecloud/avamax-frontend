import { printThemePresets, type PrintThemePreset } from './printThemePresets'
import { cn } from '@/lib/utils'
import { Palette } from 'lucide-react'

interface PdfPreviewThemeBarProps {
  selected: string
  onSelect: (theme: PrintThemePreset) => void
}

export function PdfPreviewThemeBar({ selected, onSelect }: PdfPreviewThemeBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-1 scrollbar-none">
      <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      {printThemePresets.map((theme) => {
        const isActive = selected === theme.id
        const isOriginal = theme.id === 'original'
        const isBw = theme.isMonochrome

        return (
          <button
            key={theme.id}
            onClick={() => onSelect(theme)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60'
            )}
          >
            {!isOriginal && (
              <span
                className={cn(
                  'w-3 h-3 rounded-full shrink-0 border',
                  isBw ? 'border-neutral-400' : 'border-transparent'
                )}
                style={{
                  background: isBw
                    ? 'linear-gradient(135deg, #fff 50%, #000 50%)'
                    : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              />
            )}
            {theme.label}
          </button>
        )
      })}
    </div>
  )
}
