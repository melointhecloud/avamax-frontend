import React, { useState } from 'react'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ChartBar,
    FileText,
    Building2,
} from 'lucide-react'

import logoAvaluz from '@/assets/avaluz-logo.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { supabaseService } from '@/services/supabase.service'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, type SignUpFormData } from '@/validators/SignUp'
import { showSuccess, showError } from '@/lib/sonner'
import { translateAuthError } from '@/lib/error-messages'
import { useNavigate, Link } from 'react-router-dom'

const SignUp: React.FC = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    })

    const onSubmit = async (data: SignUpFormData) => {
        try {
            await supabaseService.signUpWithEmail(
                data.email,
                data.password,
            )

            showSuccess("Conta criada com sucesso!");
            navigate("/auth/signin");

        } catch (error: unknown) {
            showError(translateAuthError(error))
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            await supabaseService.signInWithGoogle();
        } catch (error: unknown) {
            showError(translateAuthError(error))
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT / BRANDING */}
            <aside className="hidden lg:flex relative bg-[#0A3F74] text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A3F74] via-[#0B1F33] to-[#0A3F74]" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* logo */}
                    <div>
                        <img
                            src={logoAvaluz}
                            alt="Avaluz"
                            className="h-[7.5rem] w-auto"
                        />
                    </div>

                    {/* hero */}
                    <div className="space-y-8 max-w-xl">
                        <h1 className="font-heading text-[48px] leading-tight font-extrabold">
                            Transforme visitas em{' '}
                            <span className="text-[#DF6009]">
                                propostas profissionais
                            </span>
                            .
                        </h1>

                        <p className="font-body text-lg text-white/80">
                            Crie sua conta e comece a gerar avaliações de imóveis,
                            análises de mercado e relatórios PDF prontos para o
                            cliente.
                        </p>

                        <div className="space-y-4 pt-4">
                            <Feature
                                icon={<ChartBar className="w-5 h-5" />}
                                text="Avaliações baseadas em dados reais"
                            />
                            <Feature
                                icon={<FileText className="w-5 h-5" />}
                                text="Relatórios claros e profissionais"
                            />
                            <Feature
                                icon={<Building2 className="w-5 h-5" />}
                                text="Mais autoridade na negociação"
                            />
                        </div>
                    </div>

                    {/* testimonial */}
                    <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-sm">
                        <p className="font-body text-sm italic text-white/90">
                            "O cliente confia quando você mostra dados. O AvaLuz
                            faz isso por você."
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#DF6009]/20 flex items-center justify-center">
                                <span className="text-[#DF6009] font-bold">+</span>
                            </div>
                            <div>
                                <p className="font-body text-sm font-medium">
                                    Plataforma profissional
                                </p>
                                <p className="text-xs text-white/70">
                                    feita para o mercado imobiliário
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* RIGHT / FORM */}
            <main className="bg-[#F8FAFC] min-h-screen lg:flex lg:items-center lg:justify-center">
                {/* mobile logo with gradient banner */}
                <div className="lg:hidden w-full bg-gradient-to-br from-[#0A3F74] via-[#0B1F33] to-[#0A3F74] rounded-b-3xl">
                    <div className="mx-auto max-w-md px-6 pt-14 pb-10 flex justify-center">
                        <img src={logoAvaluz} alt="Avaluz" className="h-14 w-auto" />
                    </div>
                </div>

                {/* form container */}
                <div className="w-full max-w-md mx-auto space-y-8 px-6 py-10 lg:py-12">
                    {/* header */}
                    <div className="text-center space-y-2">
                        <h2 className="font-heading text-3xl font-bold text-[#0F172A]">
                            Criar conta
                        </h2>
                        <p className="font-body text-[#64748B]">
                            Comece a usar o AvaLuz hoje mesmo
                        </p>
                    </div>

                    {/* social buttons */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full h-12 gap-3 bg-white border-slate-200 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 hover:shadow-md active:scale-[0.98]"
                            onClick={handleGoogleSignUp}
                            type="button"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Cadastrar com Google
                        </Button>
                    </div>

                    {/* divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#F8FAFC] px-4 text-xs uppercase text-[#64748B] font-body">
                                ou crie com email
                            </span>
                        </div>
                    </div>

                    {/* form */}
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

                        <div className="space-y-2">
                            <Label className="font-body text-slate-700 font-medium">Senha</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#DF6009]" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Crie uma senha segura"
                                    className="pl-12 pr-12 h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md focus:border-[#DF6009] focus:outline-none focus:ring-2 focus:ring-[#DF6009]/20 focus:shadow-md focus-visible:ring-[#DF6009]/20 focus-visible:ring-offset-0"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-200 hover:text-[#DF6009] hover:scale-110 active:scale-95"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-body text-slate-700 font-medium">
                                Confirmar senha
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#DF6009]" />
                                <Input
                                    type="password"
                                    placeholder="Repita a senha"
                                    className="pl-12 h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md focus:border-[#DF6009] focus:outline-none focus:ring-2 focus:ring-[#DF6009]/20 focus:shadow-md focus-visible:ring-[#DF6009]/20 focus-visible:ring-offset-0"
                                    {...register('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="acceptTerms"
                                {...register('acceptTerms')}
                                onCheckedChange={(checked) => {
                                    const event = {
                                        target: { name: 'acceptTerms', value: checked },
                                    };
                                    register('acceptTerms').onChange(event);
                                }}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="acceptTerms"
                                    className="font-body text-sm text-[#64748B] cursor-pointer leading-tight"
                                >
                                    Li e concordo com os{' '}
                                    <a
                                        href="https://www.avaluz.com.br/termos"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#DF6009] transition-all duration-200 hover:text-[#c85508] hover:underline underline-offset-2"
                                    >
                                        Termos de Uso
                                    </a>{' '}
                                    e{' '}
                                    <a
                                        href="https://www.avaluz.com.br/privacidade"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#DF6009] transition-all duration-200 hover:text-[#c85508] hover:underline underline-offset-2"
                                    >
                                        Política de Privacidade
                                    </a>
                                </Label>
                                {errors.acceptTerms && (
                                    <p className="text-sm text-red-500">
                                        {errors.acceptTerms.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#DF6009] text-white font-semibold shadow-lg shadow-[#DF6009]/25 transition-all duration-200 hover:bg-[#c85508] hover:shadow-xl hover:shadow-[#DF6009]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                    </form>

                    {/* footer */}
                    <p className="text-center text-sm text-[#64748B] font-body">
                        Já tem uma conta?{' '}
                        <Link to="/auth/signin" className="text-[#DF6009] font-medium transition-all duration-200 hover:text-[#c85508] hover:underline underline-offset-2">
                            Entrar
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}

/* ------------------------------------------------------------------ */

const Feature = ({
    icon,
    text,
}: {
    icon: React.ReactNode
    text: string
}) => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
            {icon}
        </div>
        <span className="font-body text-white/90">
            {text}
        </span>
    </div>
)

export default SignUp;
