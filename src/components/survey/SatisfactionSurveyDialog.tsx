import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Gift, ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const STAR_LABELS = ['Não gosto', 'Pouco', 'Razoável', 'Bom', 'Muito bom', 'Adoro!']

export function SatisfactionSurveyDialog({ open, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [nota, setNota] = useState<number | null>(null)
  const [hoverNota, setHoverNota] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [ideias, setIdeias] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newBalance, setNewBalance] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const submit = async (aceitouGoogle = false) => {
    if (nota === null) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('submit_survey_with_reward', {
        p_nota: nota,
        p_comentario: comentario || null,
        p_ideias_melhoria: ideias || null,
        p_aceitou_google: aceitouGoogle,
      })
      if (error) throw error
      const result = data as any
      if (!result?.success) throw new Error(result?.error || 'Erro ao enviar')
      setNewBalance(result.new_balance)
      queryClient.invalidateQueries({ queryKey: ['user-credits'] })
      queryClient.invalidateQueries({ queryKey: ['survey-answered'] })
      setStep(4)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar pesquisa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleReview = () => {
    window.open('https://www.google.com/search?q=Avaluz', '_blank')
    onClose()
  }

  const activeNota = hoverNota ?? nota

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Step 1: Rating */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                <Gift className="h-3.5 w-3.5" /> Responda e ganhe 5 créditos!
              </div>
              <h3 className="text-lg font-semibold text-foreground">Quanto você gosta do Avaluz?</h3>
            </div>

            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverNota(i)}
                  onMouseLeave={() => setHoverNota(null)}
                  onClick={() => setNota(i)}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      activeNota !== null && i <= activeNota
                        ? 'fill-orange-400 text-orange-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
            {activeNota !== null && (
              <p className="text-center text-sm text-muted-foreground">{STAR_LABELS[activeNota]}</p>
            )}

            <Button className="w-full" disabled={nota === null} onClick={() => setStep(2)}>
              Próximo
            </Button>
          </div>
        )}

        {/* Step 2: Comments */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Tem algo que gostaria de compartilhar?</h3>
            <Textarea
              placeholder="Conte sua experiência com o Avaluz..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 1000))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{comentario.length}/1000</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Pular
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Ideas */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Que ferramenta gostaria de ver no Avaluz?</h3>
            <Textarea
              placeholder="Suas ideias nos ajudam a melhorar..."
              value={ideias}
              onChange={(e) => setIdeias(e.target.value.slice(0, 1000))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{ideias.length}/1000</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled={submitting} onClick={() => submit(false)}>
                Pular
              </Button>
              <Button className="flex-1" disabled={submitting} onClick={() => submit(false)}>
                {submitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Thank you + reward */}
        {step === 4 && (
          <div className="p-6 space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Obrigado! Você ganhou 5 créditos! 🎉</h3>
              {newBalance !== null && (
                <p className="text-sm text-muted-foreground">Seu saldo agora: <span className="font-semibold text-foreground">{newBalance} créditos</span></p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Que tal nos avaliar no Google?</p>
              <p className="text-xs text-muted-foreground">Sua avaliação ajuda outros corretores a conhecer o Avaluz</p>
              <Button className="w-full gap-2" onClick={handleGoogleReview}>
                <ExternalLink className="h-4 w-4" /> Avaliar no Google
              </Button>
            </div>

            <Button variant="ghost" className="text-muted-foreground" onClick={onClose}>
              Agora não
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
