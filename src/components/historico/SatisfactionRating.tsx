import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface SatisfactionRatingProps {
  avaliacaoId: number
  currentRating: number | null
  onRatingChange?: (rating: number) => void
}

export const SatisfactionRating = ({
  avaliacaoId,
  currentRating,
  onRatingChange,
}: SatisfactionRatingProps) => {
  const [rating, setRating] = useState<number | null>(currentRating)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRating = async (value: number) => {
    if (isSubmitting || rating === value) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({ satisfacao: value })
        .eq('id', avaliacaoId)

      if (error) throw error

      setRating(value)
      onRatingChange?.(value)
      toast.success('Avaliação registrada!')
    } catch (err) {
      console.error('Erro ao salvar satisfação:', err)
      toast.error('Erro ao salvar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating ?? rating

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={isSubmitting}
          onClick={() => handleRating(value)}
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(null)}
          className={cn(
            'p-0.5 transition-all duration-150 hover:scale-110 focus:outline-none disabled:opacity-50',
            isSubmitting && 'cursor-not-allowed'
          )}
          aria-label={`Avaliar ${value} estrela${value > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              displayRating && value <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/40'
            )}
          />
        </button>
      ))}
    </div>
  )
}
