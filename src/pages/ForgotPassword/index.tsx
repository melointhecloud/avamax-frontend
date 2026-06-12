import React from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import logoAvaluz from '@/assets/avaluz-logo.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/services/supabase.service'
import { showError, showSuccess } from '@/lib/sonner'
import { translateAuthError } from '@/lib/error-messages'
import { Link } from 'react-router-dom'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPassword: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await supabaseService.resetPassword(data.email)
            showSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.")
        } catch (error: unknown) {
            showError(translateAuthError(error))
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center">
                    <img
                        src={logoAvaluz}
                        alt="Avaluz"
                        className="h-10 w-auto"
                    />
                </div>

                <div className="text-center space-y-2">
                    <h2 className="font-heading text-3xl font-bold text-[#0F172A]">
                        Esqueceu a senha?
                    </h2>
                    <p className="font-body text-[#64748B]">
                        Digite seu email e enviaremos um link para redefinir sua senha
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-2">
                        <Label className="font-body text-slate-700 font-medium">Email</Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#DF6009]" />
                            <Input
                                placeholder="seu@email.com"
                                className="pl-12 h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md focus:border-[#DF6009] focus:outline-none focus:ring-2 focus:ring-[#DF6009]/20 focus:shadow-md focus-visible:ring-[#DF6009]/20 focus-visible:ring-offset-0"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#DF6009] text-white font-semibold shadow-lg shadow-[#DF6009]/25 transition-all duration-200 hover:bg-[#c85508] hover:shadow-xl hover:shadow-[#DF6009]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
                    </Button>
                </form>

                <Link 
                    to="/auth/signin" 
                    className="flex items-center justify-center gap-2 text-sm text-[#64748B] transition-all duration-200 hover:text-[#DF6009] hover:gap-3"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200" />
                    Voltar para o login
                </Link>
            </div>
        </div>
    )
}

export default ForgotPassword
