import { z } from 'zod'
import { PROPERTY_TYPES } from '@/pages/AvaliarImovel/types/specifications'

const propertyTypeEnum = z.enum(PROPERTY_TYPES)

const especificacoesSchema = z.object({
  tipo: propertyTypeEnum,
  checklist: z.record(z.string(), z.boolean().default(false).catch(false)),
  detalhes: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
}).optional()

const featuresSchema = z.object({
  byGroup: z.record(z.string(), z.array(z.string())).default({}),
  selected: z.array(z.string()).default([]),
}).default({ byGroup: {}, selected: [] })

export const avaliarImovelSchema = z.object({
  // Tipo de Avaliação
  tipoAvaliacao: z.enum(['venda', 'aluguel']).default('venda'),

  // Dados do Cliente (opcionais)
  clienteAtivo: z.boolean().default(false),
  clienteNome: z.string().optional(),
  clienteEmail: z.string().email('Informe um e-mail válido').optional().or(z.literal('')),
  clienteTelefone: z.string().optional(),

  // Localização
  cep: z.string().optional(),
  estado: z.string().min(1, 'Selecione um estado'),
  municipio: z.string().min(1, 'Selecione um município'),
  bairro: z.string().min(1, 'Informe o bairro'),
  rua: z.string().optional(),

  // Categoria
  categoria: z.string().min(1, 'Selecione a categoria'),

  // Características Físicas
  areaTotal: z.coerce.number().min(1, 'Informe a área'),
  quartos: z.coerce.number().min(0),
  suites: z.coerce.number().min(0),
  banheiros: z.coerce.number().min(0),
  vagas: z.coerce.number().min(0),

  // Informações Financeiras
  valor: z.coerce.number().optional(),
  condominio: z.coerce.number().optional(),

  // Descrição
  descricao: z.string().optional(),

  // Avaliação Detalhada
  aVenda: z.boolean().optional(),
  linkVenda: z.string().url('Informe um link válido').optional().or(z.literal('')),
  avaliacaoTecnica: z.coerce.number().min(1).max(5).optional(),
  localizacao: z.coerce.number().min(1).max(5).optional(),
  planta: z.coerce.number().min(1).max(5).optional(),
  acabamentos: z.coerce.number().min(1).max(5).optional(),
  conservacao: z.coerce.number().min(1).max(5).optional(),
  areasComuns: z.coerce.number().min(1).max(5).optional(),
  situacaoLegal: z.array(z.string()).default([]),
  iptu: z.coerce.number().optional(),
  locaisProximos: z.string().optional(),
  mobiliado: z.string().optional(),

  // Especificações condicionais por tipo
  especificacoes: especificacoesSchema,

  // Características do imóvel (checkboxes)
  features: featuresSchema,
}).superRefine((data, ctx) => {
  // Validação condicional: Nome do cliente obrigatório se clienteAtivo
  if (data.clienteAtivo && (!data.clienteNome || data.clienteNome.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe o nome do cliente',
      path: ['clienteNome'],
    })
  }
  // Sincronizar selected com byGroup
  if (data.features?.byGroup) {
    const allSelected = Object.values(data.features.byGroup).flat();
    data.features.selected = [...new Set(allSelected)];
  }
  // Validação condicional: COMERCIAL com alugado precisa de valor
  if (data.especificacoes?.tipo === 'COMERCIAL') {
    const isAlugado = data.especificacoes.checklist?.['esta_alugado']
    const aluguelAtual = data.especificacoes.detalhes?.['aluguel_atual']
    
    if (isAlugado && (!aluguelAtual || Number(aluguelAtual) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o valor do aluguel atual',
        path: ['especificacoes', 'detalhes', 'aluguel_atual'],
      })
    }
  }

  // Validação condicional: TERRENO com potencial construtivo precisa de pavimentos
  if (data.especificacoes?.tipo === 'TERRENO') {
    const temPotencial = data.especificacoes.checklist?.['potencial_construtivo']
    const pavimentos = data.especificacoes.detalhes?.['pavimentos_permitidos']
    
    if (temPotencial && (!pavimentos || Number(pavimentos) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe quantos pavimentos são permitidos',
        path: ['especificacoes', 'detalhes', 'pavimentos_permitidos'],
      })
    }
  }

  // Validação condicional: RURAL precisa de área em hectares se área produtiva marcada
  if (data.especificacoes?.tipo === 'RURAL') {
    const temAreaInfo = data.especificacoes.checklist?.['area_total_hectares_info']
    const areaHectares = data.especificacoes.detalhes?.['area_total_hectares']
    
    if (temAreaInfo && (!areaHectares || Number(areaHectares) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a área total em hectares',
        path: ['especificacoes', 'detalhes', 'area_total_hectares'],
      })
    }

    const temAreaProdutivaInfo = data.especificacoes.checklist?.['area_produtiva_hectares_info']
    const areaProdutiva = data.especificacoes.detalhes?.['area_produtiva_hectares']
    
    if (temAreaProdutivaInfo && (!areaProdutiva || Number(areaProdutiva) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a área produtiva em hectares',
        path: ['especificacoes', 'detalhes', 'area_produtiva_hectares'],
      })
    }
  }
})

export type AvaliarImovelFormData = z.infer<typeof avaliarImovelSchema>
