import { supabase } from '@/integrations/supabase/client'
import { invokeEdgeFunction } from '@/lib/supabase-edge'

export interface BuscarImoveisFormData {
  estado: string
  municipio: string
  bairro: string
  area?: number
  quartos?: number
  banheiros?: number
  vagas?: number
  categoria: string
  limite: number
}

// Resposta da Edge Function
interface EdgeFunctionResponse {
  imoveis: Array<{
    id: number
    raw: {
      Metros: number
      Valor: string
      Categoria: string
      Quartos: number | null
      Banheiros: number | null
      Vagas: number | null
      Suite: number | null
      Bairro: string
      Rua: string | null
      Midia_Imovel: string | null
      Descricao: string | null
      Anunciante: string | null
      Telefone_Anunciante: string | null
      valores_anteriores: string | null
      disponivel: boolean
      Link: string | null
      latitude: string | null
      longetude: string | null
    }
    score: number
    mesmoBairro: boolean
  }>
  total: number
}

// Transform the raw result to a format suitable for display
export interface PropertyForDisplay {
  id: number
  valor: number
  metros: number
  quartos: number | null
  banheiros: number | null
  vagas: number | null
  suites: number | null
  categoria: string | null
  descricao: string | null
  imagem: string | null
  bairro: string | null
  rua: string | null
  anunciante: string | null
  telefoneAnunciante: string | null
  valoresAnteriores: string | null
  disponivel: boolean
  score: number
  mesmoBairro: boolean
  link: string | null
  latitude: number | null
  longitude: number | null
}

export async function buscarImoveisParaCompra(
  data: BuscarImoveisFormData
): Promise<PropertyForDisplay[]> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session) {
    throw new Error('Usuário não autenticado')
  }

  const { data: responseData, error } = await invokeEdgeFunction<EdgeFunctionResponse>('buscar-imoveis', {
    body: {
      estado: data.estado,
      municipio: data.municipio,
      bairro: data.bairro,
      area: data.area || null,
      quartos: data.quartos || null,
      banheiros: data.banheiros || null,
      vagas: data.vagas || null,
      categoria: data.categoria || null,
      limite: data.limite || 10
    }
  })

  if (error) {
    throw error
  }

  const imoveis = responseData?.imoveis || []
  
  // Transformar para formato de display
  return imoveis.map((item) => ({
    id: item.id,
    valor: parseValor(item.raw.Valor),
    metros: item.raw.Metros || 0,
    quartos: item.raw.Quartos,
    banheiros: item.raw.Banheiros,
    vagas: item.raw.Vagas,
    suites: item.raw.Suite,
    categoria: item.raw.Categoria,
    descricao: item.raw.Descricao,
    imagem: item.raw.Midia_Imovel,
    bairro: item.raw.Bairro,
    rua: item.raw.Rua,
    anunciante: item.raw.Anunciante,
    telefoneAnunciante: item.raw.Telefone_Anunciante || null,
    valoresAnteriores: item.raw.valores_anteriores,
    disponivel: item.raw.disponivel ?? true,
    score: item.score,
    mesmoBairro: item.mesmoBairro,
    link: item.raw.Link,
    latitude: item.raw.latitude ? parseFloat(item.raw.latitude) : null,
    longitude: item.raw.longetude ? parseFloat(item.raw.longetude) : null,
  }))
}
function parseValor(valorStr: string | null): number {
  if (!valorStr) return 0
  const cleaned = valorStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(cleaned) || 0
}
