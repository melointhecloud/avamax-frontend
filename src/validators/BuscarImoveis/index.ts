import { z } from 'zod'

export const buscarImoveisSchema = z.object({
  estado: z.string().min(2, 'Estado é obrigatório'),
  municipio: z.string().min(1, 'Município é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cep: z.string().optional(),
  area: z.number().min(0).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  quartos: z.number().min(0).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  banheiros: z.number().min(0).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  vagas: z.number().min(0).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  categoria: z.string().optional(),
  limite: z.number().min(1).max(50).default(10),
})

export type BuscarImoveisFormData = z.infer<typeof buscarImoveisSchema>

