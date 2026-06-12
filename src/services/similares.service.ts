import { supabase } from '@/integrations/supabase/client'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import type { SimilarPropertyData } from '@/components/evaluation/SimilarPropertyCard'

/**
 * Faz upload de uma imagem para o storage do Supabase
 * Retorna a URL pública da imagem
 */
export async function uploadPropertyImage(file: File, userId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('evaluation-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    return null
  }

  // Retorna a URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('evaluation-images')
    .getPublicUrl(data.path)

  return publicUrl
}

const BUSCAR_SIMILARES_URL = 'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/buscar-similares'
const GERAR_AVALIACAO_URL = 'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/avaliacao-imovel'

export interface BuscarSimilaresResponse {
  confianca: number
  valor_estimado: number
  similares: Array<{
    id: number
    valor: number
    distancia: number
    score: number            // Score de similaridade (0-100)
    mesmoBairro: boolean     // Se é do mesmo bairro
    raw: {
      Metros: number
      Valor: string
      Categoria: string
      Quartos: number | null
      Banheiros: number | null
      Vagas: number | null
      Midia_Imovel: unknown
      Descricao: string | null
      Bairro?: string | null
      Link?: string | null
      latitude?: string | null
      longetude?: string | null
      Telefone_Anunciante?: string | null
    }
  }>
}

export interface GerarAvaliacaoResponse {
  user_id: string
  valor_medio: number
  quantidade_base: number
  confianca: number
  ids_utilizados: number[]
  avaliacao_id?: number // ID da avaliação criada (se retornado pela edge function)
}

/**
 * Preserva o campo Midia_Imovel para permitir extração de múltiplas imagens no UI.
 * Pode vir como string (URL única ou string de array), ou array já parseado.
 */
function normalizeMediaField(midiaImovel: unknown): unknown | null {
  if (!midiaImovel) return null
  if (typeof midiaImovel === 'string') return midiaImovel.trim()
  return midiaImovel
}

/**
 * Busca imóveis similares baseado nos dados do formulário
 * Esta é a primeira etapa do fluxo de avaliação
 */
export async function buscarImoveisSimilares(data: AvaliarImovelFormData): Promise<{
  similares: SimilarPropertyData[]
  valorEstimadoInicial: number
  confianca: number
  tipoAvaliacao: 'venda' | 'aluguel'
}> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado')
  }

  const payload = {
    estado: data.estado,
    municipio: data.municipio,
    bairro: data.bairro,
    rua: data.rua,
    categoria: data.categoria,
    area: data.areaTotal,
    quartos: data.quartos,
    banheiros: data.banheiros,
    vagas: data.vagas,
    valor: data.valor,
    condominio: data.condominio,
    iptu: data.iptu,
    descricao: data.descricao,
    locaisProximos: data.locaisProximos,
    avaliacaoTecnica: data.avaliacaoTecnica,
    localizacao: data.localizacao,
    planta: data.planta,
    acabamentos: data.acabamentos,
    conservacao: data.conservacao,
    areasComuns: data.areasComuns,
    situacaoLegal: data.situacaoLegal,
    mobiliado: data.mobiliado,
    aVenda: data.aVenda,
  }

  const response = await fetch(BUSCAR_SIMILARES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  })

  const result: BuscarSimilaresResponse = await response.json()

  if (!response.ok) {
    throw new Error((result as any)?.error || 'Erro ao buscar imóveis similares')
  }

  const isRental = data.tipoAvaliacao === 'aluguel'
  const taxaAluguel = 0.005 // ~0.5% do valor de venda

  // Transforma os dados para o formato do componente
  // Se for aluguel, converte os valores para valor de locação
  const similares: SimilarPropertyData[] = result.similares.map((s) => ({
    id: s.id,
    valor: isRental ? Math.round(s.valor * taxaAluguel) : s.valor,
    metros: s.raw?.Metros || 0,
    quartos: s.raw?.Quartos ?? null,
    banheiros: s.raw?.Banheiros ?? null,
    vagas: s.raw?.Vagas ?? null,
    categoria: s.raw?.Categoria ?? null,
    descricao: s.raw?.Descricao ?? null,
    imagem: normalizeMediaField(s.raw?.Midia_Imovel),
    bairro: s.raw?.Bairro ?? null,
    link: s.raw?.Link ?? null,
    score: s.score ?? 0,
    mesmoBairro: s.mesmoBairro ?? false,
    latitude: s.raw?.latitude ? parseFloat(s.raw.latitude) : null,
    longitude: s.raw?.longetude ? parseFloat(s.raw.longetude) : null,
    telefoneAnunciante: s.raw?.Telefone_Anunciante ?? null,
  }))

  // Valor estimado também convertido se for aluguel
  const valorEstimado = isRental 
    ? Math.round(result.valor_estimado * taxaAluguel) 
    : result.valor_estimado

  return {
    similares,
    valorEstimadoInicial: valorEstimado,
    confianca: result.confianca,
    // Prioriza tipoAvaliacao se definido, senão deriva de aVenda
    tipoAvaliacao: data.tipoAvaliacao || (data.aVenda === true ? 'venda' : 'aluguel'),
  }
}

/**
 * Gera a avaliação final com os imóveis selecionados
 * Esta é a segunda etapa do fluxo de avaliação
 * Formato esperado: { input: {...}, ids: [...] }
 *
 * IMPORTANTE: imóveis adicionados manualmente (`_isManual: true`) não existem
 * no banco e não podem ser enviados para a edge function externa `avaliacao-imovel`.
 * São mesclados localmente após o cálculo.
 */
export async function gerarAvaliacaoFinal(
  data: AvaliarImovelFormData,
  selectedProperties: SimilarPropertyData[],
  fotoCapaUrl?: string | null
): Promise<GerarAvaliacaoResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Usuário não autenticado')
  }

  // Separa imóveis reais (no banco) dos manuais (adicionados via link)
  const manualProperties = selectedProperties.filter((p) => p._isManual)
  const realProperties = selectedProperties.filter((p) => !p._isManual)
  const realIds = realProperties.map((p) => p.id)

  const tipoAvaliacao = data.tipoAvaliacao || (data.aVenda === true ? 'venda' : 'aluguel');

  const inputPayload = {
      // Tipo de avaliação (venda ou aluguel)
      tipoAvaliacao,

      // Localização
      estado: data.estado,
      municipio: data.municipio,
      bairro: data.bairro,
      rua: data.rua,
      cep: data.cep,

      // Tipo e características básicas
      categoria: data.categoria,
      areaTotal: data.areaTotal,
      area: data.areaTotal,
      quartos: data.quartos,
      suites: data.suites,
      banheiros: data.banheiros,
      vagas: data.vagas,

      // Valores financeiros
      valor: data.valor,
      condominio: data.condominio,
      iptu: data.iptu,

      // Descrição e informações extras
      descricao: data.descricao,
      locaisProximos: data.locaisProximos,

      // Avaliações de qualidade (1-5)
      avaliacaoTecnica: data.avaliacaoTecnica,
      localizacao: data.localizacao,
      planta: data.planta,
      acabamentos: data.acabamentos,
      conservacao: data.conservacao,
      areasComuns: data.areasComuns,

      // Situação legal e mobília
      situacaoLegal: data.situacaoLegal,
      mobiliado: data.mobiliado,

      // Venda
      aVenda: data.aVenda,
      linkVenda: data.linkVenda,

      // Dados do cliente
      clienteAtivo: data.clienteAtivo,
      clienteNome: data.clienteNome,
      clienteEmail: data.clienteEmail,
      clienteTelefone: data.clienteTelefone,

      // Features
      features: {
        byGroup: data.features?.byGroup || {},
        selected: data.features?.selected || [],
      },

      // Especificações do tipo de imóvel
      especificacoes: data.especificacoes,

      // Foto de capa (URL do storage)
      foto_capa: fotoCapaUrl || null,
  }

  // Caminho A: temos pelo menos 3 imóveis REAIS — usa edge function externa
  let result: GerarAvaliacaoResponse

  if (realIds.length >= 3) {
    const payload = {
      input: inputPayload,
      ids: realIds,
    }

    const response = await fetch(GERAR_AVALIACAO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    })

    result = await response.json()

    if (!response.ok) {
      throw new Error((result as any)?.error || 'Erro ao gerar avaliação')
    }

    // Se há manuais, recalcula média ponderada incluindo-os
    if (manualProperties.length > 0) {
      const externalAvg = Number(result.valor_medio) || 0
      const externalCount = Number(result.quantidade_base) || realIds.length
      // Score equivalente para a parcela externa (usa 75 como score médio típico)
      const externalScore = 75 * externalCount
      const manualScoreSum = manualProperties.reduce((acc, p) => acc + (p.score ?? 100), 0)
      const totalScore = externalScore + manualScoreSum

      const valorMedio = totalScore > 0
        ? (externalAvg * externalScore + manualProperties.reduce(
            (acc, p) => acc + (p.valor * (p.score ?? 100)), 0
          )) / totalScore
        : externalAvg

      result = {
        ...result,
        valor_medio: Math.round(valorMedio),
        quantidade_base: externalCount + manualProperties.length,
        ids_utilizados: [...(result.ids_utilizados || realIds), ...manualProperties.map((p) => p.id)],
      }
    }
  } else {
    // Caminho B: imóveis reais < 3 — calcula 100% localmente e consome crédito via RPC
    // (cobertura para cenário em que a maioria/todas as amostras são manuais)
    const { data: creditResult, error: creditError } = await supabase.rpc('consumir_credito' as any, {
      p_user_id: session.user.id,
    })

    if (creditError) {
      throw new Error(creditError.message || 'Erro ao consumir crédito')
    }

    if (creditResult && typeof creditResult === 'object' && 'success' in creditResult && !(creditResult as any).success) {
      throw new Error((creditResult as any).error || 'Créditos insuficientes')
    }

    const all = selectedProperties
    const totalScore = all.reduce((acc, p) => acc + (p.score ?? 100), 0)
    const valorMedio = totalScore > 0
      ? all.reduce((acc, p) => acc + (p.valor * (p.score ?? 100)), 0) / totalScore
      : all.reduce((acc, p) => acc + p.valor, 0) / all.length

    result = {
      user_id: session.user.id,
      valor_medio: Math.round(valorMedio),
      quantidade_base: all.length,
      confianca: Math.min(0.95, 0.5 + (all.length / 15) * 0.3),
      ids_utilizados: all.map((p) => p.id),
    }
  }

  // Após a criação, atualiza o input da avaliação para garantir que todos os campos estão salvos
  let avaliacaoId = result.avaliacao_id

  if (!avaliacaoId) {
    const { data: recentEval } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (recentEval) {
      avaliacaoId = recentEval.id
    }
  }

  if (avaliacaoId) {
    const { error: updateError } = await supabase
      .from('avaliacoes')
      .update({
        input: inputPayload,
      })
      .eq('id', avaliacaoId)

    if (updateError) {
      console.error('❌ Erro ao atualizar input:', updateError)
    }

    result.avaliacao_id = avaliacaoId
  }

  return result
}
