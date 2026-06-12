import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'

export interface SimilarProperty {
  id: number
  titulo: string
  descricao: string
  valor: number
  area: number
  quartos: number
  banheiros: number
  vagas: number
  imagem?: unknown
  raw?: Record<string, unknown>
}

export interface EvaluationResult {
  id: number
  valor_estimado: number
  confianca: number
  minimo: number
  maximo: number
  valor_m2: number
  similares: SimilarProperty[]
  observacoes?: string
}

export interface EvaluationState {
  id: number
  inputPayload: AvaliarImovelFormData
  resultPayload: EvaluationResult
  createdAt: string
}

export type EditMode = 'preview' | 'edit'

export const EDIT_TAB_IDS = ['localizacao', 'caracteristicas', 'financeiro', 'especificacoes', 'avaliacao'] as const
export type EditTabId = typeof EDIT_TAB_IDS[number]
