import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPassword: React.FC = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await supabaseService.updatePassword(data.password)
            showSuccess("Senha atualizada com sucesso!")
            navigate("/auth/signin")
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
                        Redefinir senha
                    </h2>
                    <p className="font-body text-[#64748B]">
                        Digite sua nova senha
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-2">
                        <Label className="font-body">Nova senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-12 pr-12"
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-body">Confirmar nova senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-12"
                                {...register('confirmPassword')}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full bg-[#DF6009] hover:bg-[#DF6009]/90 text-white"
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
