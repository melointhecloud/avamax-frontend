import { supabase } from '@/integrations/supabase/client'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'

const EDGE_URL = 'https://jdvikyeethbirrdcawbs.supabase.co/functions/v1/avaliar'

export async function avaliarImovelEdge(data: AvaliarImovelFormData) {
    // 🔐 Recupera o token do usuário logado
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
        throw new Error('Usuário não autenticado')
    }

    // 🔄 Mapeia os campos do formulário para o formato esperado pela Edge
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

    const response = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result?.error || 'Erro ao gerar avaliação')
    }

    return result
}
