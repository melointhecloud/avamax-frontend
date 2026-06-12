import { z } from "zod";

export const signUpSchema = z
    .object({
        email: z
            .string()
            .min(1, 'Email é obrigatório')
            .email('Email inválido'),
        password: z
            .string()
            .min(6, 'A senha deve ter no mínimo 6 caracteres'),
        confirmPassword: z
            .string()
            .min(1, 'Confirme sua senha'),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, {
                message: 'Você deve aceitar os termos de privacidade',
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'As senhas não coincidem',
    });

export type SignUpFormData = z.infer<typeof signUpSchema>
