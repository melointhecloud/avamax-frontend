import { z } from 'zod'

export const updateProfileSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').nullable().optional(),
  telefone: z.string().nullable().optional(),
  creci: z.string().nullable().optional(),
  imobiliaria: z.string().nullable().optional(),
  avatar_url: z.string().url('URL de avatar inválida').nullable().optional(),
  logo_imobiliaria_url: z.string().url('URL de logo inválida').nullable().optional(),
  signature_url: z.string().url('URL de assinatura inválida').nullable().optional(),
}).strict('Campos adicionais não são permitidos. Atualização rejeitada.')

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
