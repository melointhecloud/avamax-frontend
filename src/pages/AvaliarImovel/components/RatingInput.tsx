import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export const RatingInput = ({ label, value, onChange }: RatingInputProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                'h-5 w-5 transition-colors',
                star <= value
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground/30 hover:text-primary/50'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
