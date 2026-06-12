import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/integrations/supabase/client'
import { invokeAuthenticatedEdgeFunction } from '@/lib/supabase-edge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { translateAuthError } from '@/lib/error-messages'
import { Loader2, Trash2, AlertTriangle, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

type Step = 'confirm' | 'code' | 'deleting'

const codeSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
})

type CodeFormData = z.infer<typeof codeSchema>

interface DeleteAccountDialogProps {
  children: React.ReactNode
}

export const DeleteAccountDialog = ({ children }: DeleteAccountDialogProps) => {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('confirm')
  const [isSending, setIsSending] = useState(false)
  const [code, setCode] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSendCode = async () => {
    if (!user || !profile?.email) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsSending(true)
    try {
      const { error } = await invokeAuthenticatedEdgeFunction('send-delete-confirmation', {
        body: { userId: user.id, email: profile.email },
      })

      if (error) return

      toast.success('Código de confirmação enviado para seu email')
      setStep('code')
    } catch (error: unknown) {
      console.error('Error sending code:', error)
      toast.error(translateAuthError(error))
    } finally {
      setIsSending(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!user || code.length !== 6) {
      toast.error('Código inválido')
      return
    }

    setIsDeleting(true)
    setStep('deleting')
    
    try {
      const { error } = await invokeAuthenticatedEdgeFunction('confirm-delete-account', {
        body: { userId: user.id, code },
      })

      if (error) {
        setStep('code')
        setIsDeleting(false)
        return
      }

      toast.success('Conta excluída com sucesso')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error: unknown) {
      console.error('Error deleting account:', error)
      toast.error(translateAuthError(error))
      setStep('code')
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setStep('confirm')
      setCode('')
      setIsSending(false)
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Excluir Conta
              </DialogTitle>
              <DialogDescription>
                Esta ação é <strong>irreversível</strong>. Todos os seus dados, avaliações e créditos serão permanentemente excluídos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  <strong>Atenção:</strong> Ao confirmar, enviaremos um código de verificação para seu email. Você precisará inseri-lo para concluir a exclusão.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSendCode}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Código
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Digite o código de 6 dígitos enviado para <strong>{profile?.email}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                O código expira em 15 minutos
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('confirm')}
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={code.length !== 6 || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Minha Conta'
                  )}
                </Button>
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {isSending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
          </>
        )}

        {step === 'deleting' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-destructive" />
            <p className="mt-4 text-lg font-medium">Excluindo sua conta...</p>
            <p className="text-sm text-muted-foreground">Por favor, aguarde</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
