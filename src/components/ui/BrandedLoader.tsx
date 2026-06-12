import logo from '@/assets/avaluz-logo.png'
import { cn } from '@/lib/utils'

interface BrandedLoaderProps {
  fullScreen?: boolean
  className?: string
}

export const BrandedLoader = ({ fullScreen = true, className }: BrandedLoaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative">
        <img
          src={logo}
          alt="AvaLuz"
          className="h-16 w-auto animate-pulse"
        />
        <div className="absolute inset-0 animate-ping opacity-20">
          <img src={logo} alt="" className="h-16 w-auto" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  )
}
