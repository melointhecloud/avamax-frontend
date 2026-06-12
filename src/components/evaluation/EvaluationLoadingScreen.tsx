import { useEffect, useState } from 'react'
import { Home, Database, Calculator, FileText, CheckCircle, Sparkles } from 'lucide-react'
import logo from '@/assets/avaluz-logo.png'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EvaluationLoadingScreenProps {
  isOpen: boolean
}

const STEPS = [
  { icon: Home, message: 'Analisando dados do imóvel...', progress: 15 },
  { icon: Database, message: 'Consultando bases de mercado...', progress: 35 },
  { icon: Calculator, message: 'Calculando valor estimado...', progress: 55 },
  { icon: FileText, message: 'Gerando relatório de avaliação...', progress: 75 },
  { icon: Sparkles, message: 'Finalizando análise...', progress: 95 },
]

export const EvaluationLoadingScreen = ({ isOpen }: EvaluationLoadingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Animate progress smoothly
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const target = STEPS[currentStep]?.progress || 95
        if (prev < target) {
          return Math.min(prev + 1, target)
        }
        return prev
      })
    }, 50)

    // Change steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const CurrentIcon = STEPS[currentStep]?.icon || Sparkles

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8 px-4 text-center">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute -inset-10 animate-pulse rounded-full bg-primary/40 blur-3xl" />
          <img
            src={logo}
            alt="AvaLuz"
            className="relative h-20 w-auto animate-pulse"
          />
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-md space-y-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{progress}% concluído</p>
        </div>

        {/* Step Icons */}
        <div className="flex items-center gap-3">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary/20 text-primary animate-pulse',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className={cn('h-5 w-5', isActive && 'animate-bounce')} />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-6 transition-all duration-500',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Current Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <CurrentIcon className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium text-foreground">
              {STEPS[currentStep]?.message}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Isso pode levar alguns segundos...
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
