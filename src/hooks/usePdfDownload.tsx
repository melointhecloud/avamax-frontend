import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { resolveEvaluationCoverUrl } from '@/services/evaluation-images.service'
import { TenantPdfPreviewDialog } from '@/components/pdf/TenantPdfPreviewDialog'
import { useTenant } from '@/contexts/TenantContext'
import { getImageUrlForPdf, getMultipleImagesForPdf } from '@/lib/pdfImages'

interface UsePdfDownloadReturn {
  isDownloading: boolean
  downloadingId: number | null
  downloadPdf: (evaluationId: number) => Promise<void>
  PdfRenderer: () => JSX.Element | null
}

// Transform database data to report format
const transformDataToReport = (data: any, profile: any, userEmail?: string) => {
  if (!data) return null
  
  const { input, resultado } = data
  const valEstimado = resultado?.valor_estimado || 0

  const selectedFeatures = Array.isArray(input?.features)
    ? input.features
    : Array.isArray(input?.features?.selected)
      ? input.features.selected
      : []

  return {
    clientName: input?.clienteNome || profile?.nome || userEmail || 'Cliente Avaluz',
    client: input?.clienteAtivo && input?.clienteNome ? {
      nome: input.clienteNome,
      email: input.clienteEmail || undefined,
      telefone: input.clienteTelefone || undefined,
    } : undefined,
    property: {
      id: data.id,
      rua: input?.rua || '',
      bairro: input?.bairro || '',
      municipio: input?.municipio || '',
      estado: input?.estado || '',
      area: Number(input?.area) || Number(input?.areaTotal) || 0,
      quartos: Number(input?.quartos) || 0,
      suites: Number(input?.suites) || (Number(input?.banheiros) > 1 ? Number(input?.banheiros) - 1 : 0),
      banheiros: Number(input?.banheiros) || 0,
      vagas: Number(input?.vagas) || 0,
      valor_atual: Number(input?.valor) || valEstimado,
      tipo: input?.categoria || 'Imóvel',
      foto_capa: input?.foto_capa || null,
      // Dados extras do formulário
      cep: input?.cep || undefined,
      condominio: Number(input?.condominio) || undefined,
      iptu: Number(input?.iptu) || undefined,
      aVenda: input?.aVenda || false,
      linkVenda: input?.linkVenda || undefined,
      mobiliado: input?.mobiliado || undefined,
      situacaoLegal: input?.situacaoLegal || undefined,
      locaisProximos: input?.locaisProximos || undefined,
      descricao: input?.descricao || undefined,
      // Avaliações (1-5)
      avaliacaoTecnica: Number(input?.avaliacaoTecnica) || undefined,
      localizacao: Number(input?.localizacao) || undefined,
      planta: Number(input?.planta) || undefined,
      acabamentos: Number(input?.acabamentos) || undefined,
      conservacao: Number(input?.conservacao) || undefined,
      areasComuns: Number(input?.areasComuns) || undefined,
      // Features selecionadas
      features: selectedFeatures,
      // Especificações do tipo
      especificacoes: input?.especificacoes || undefined,
    },
    market: {
      valor_estimado: valEstimado,
      confianca: resultado?.confianca || 0.85,
      amostras: resultado?.similares?.length || 0,
      minimo: resultado?.minimo || valEstimado * 0.9,
      medio: valEstimado,
      maximo: resultado?.maximo || valEstimado * 1.1,
      similares: (resultado?.similares || []).map((s: any, index: number) => {
        const raw = s.raw || {}
        let imagemUrl = ""
        try {
          if (raw.Midia_Imovel) {
            const midiaStr = String(raw.Midia_Imovel)
            
            // Caso 1: Já é um array
            if (Array.isArray(raw.Midia_Imovel)) {
              imagemUrl = raw.Midia_Imovel[0] || ""
            }
            // Caso 2: String que parece array (formato Python com aspas simples ou JSON)
            else if (midiaStr.startsWith('[')) {
              // Substituir aspas simples por duplas e valores Python para JSON válido
              const jsonString = midiaStr
                .replace(/'/g, '"')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false')
                .replace(/None/g, 'null')
              const images = JSON.parse(jsonString)
              imagemUrl = Array.isArray(images) ? (images[0] || "") : ""
            }
            // Caso 3: URL direta
            else if (midiaStr.startsWith('http')) {
              imagemUrl = midiaStr
            }
            // Caso 4: Outro string qualquer (pode ser URL sem http)
            else if (midiaStr.length > 0) {
              imagemUrl = midiaStr
            }
          }
        } catch (e) {
          console.warn('[PDF] Erro ao parsear Midia_Imovel:', e, raw.Midia_Imovel)
        }

        let descricaoCompleta = ''
        if (raw.Descricao) {
          descricaoCompleta = String(raw.Descricao)
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .trim()
          // Descrição completa - truncagem visual controlada pelo CSS do PDF (line-clamp)
        }

        return {
          id: s.id || index,
          titulo: raw.Titulo || raw.Categoria || `Amostra ${index + 1}`,
          descricao: descricaoCompleta || 'Descrição não disponível.',
          valor: s.valor || 0,
          area: Number(raw.Metros) || 0,
          quartos: Number(raw.Quartos) || 0,
          suites: Number(raw.Suites) || 0,
          banheiros: Number(raw.Banheiros) || 0,
          vagas: Number(raw.Vagas) || 0,
          // Usar proxy para resolver CORS em imagens externas
          imagem: getImageUrlForPdf(raw.Midia_Imovel),
          imagens: getMultipleImagesForPdf(raw.Midia_Imovel, 4),
          status: (raw.Status && String(raw.Status).toLowerCase().includes('vendido')) ? 'vendido' : 'ativo',
          // Dados de localização da amostra
          rua: raw.Rua || null,
          bairro: raw.Bairro || null,
          municipio: raw.Municipio || null,
          estado: raw.Estado || null,
          link: raw.Link || null,
          categoria: raw.Categoria || null
        }
      })
    },
    broker: profile ? {
      nome: profile.nome,
      email: profile.email,
      creci: profile.creci,
      avatar_url: profile.avatar_url,
      imobiliaria: profile.imobiliaria,
      logo_imobiliaria_url: profile.logo_imobiliaria_url,
      signature_url: profile.signature_url
    } : undefined,
    settings: {
      showMinimo: true,
      showMaximo: true
    },
    // Include original data for type detection
    tipoAvaliacao: input?.tipoAvaliacao || 'venda'
  }
}

export const usePdfDownload = (): UsePdfDownloadReturn => {
  const { user, profile } = useAuth()
  const tenant = useTenant()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  
  // State for the PDF preview dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pdfData, setPdfData] = useState<any>(null)
  const [pdfType, setPdfType] = useState<'venda' | 'aluguel'>('venda')
  const [documentTitle, setDocumentTitle] = useState('')

  const downloadPdf = useCallback(async (evaluationId: number): Promise<void> => {
    if (isDownloading) return

    setIsDownloading(true)
    setDownloadingId(evaluationId)

    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', evaluationId)
        .single()

      if (error) throw error

      const transformed = transformDataToReport(data, profile, user?.email)

      // Resolve cover image URL
      if (transformed && data?.user_id) {
        const resolvedCover = await resolveEvaluationCoverUrl({
          userId: data.user_id,
          evaluationId: data.id,
          evaluationCreatedAt: data.created_at,
          fallbackUrl: transformed.property?.foto_capa,
        })
        transformed.property.foto_capa = resolvedCover
      }

      if (transformed) {
        const tipo = transformed.tipoAvaliacao || 'venda'
        setPdfData(transformed)
        setPdfType(tipo)
        const brand = tenant.brandName
        setDocumentTitle(`Avaliacao_${tipo === 'aluguel' ? 'Aluguel' : 'Venda'}_${brand}_${evaluationId}`)
        setDialogOpen(true)
      }
    } catch (err) {
      console.error('Erro ao preparar dados do PDF:', err)
    } finally {
      setIsDownloading(false)
      setDownloadingId(null)
    }
  }, [isDownloading, profile, user?.email])

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
    setPdfData(null)
  }, [])

  // Component that renders the PDF preview dialog - Conditional: RE/MAX or Avaluz
  const PdfRenderer = useCallback(() => {
    if (!pdfData) return null
    
    // Single-tenant AvaMax app: always the tenant-branded PDF dialog.
    return (
      <TenantPdfPreviewDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        reportData={pdfData}
        reportType={pdfType}
        documentTitle={documentTitle}
        companyName={tenant.brandName}
      />
    )
  }, [dialogOpen, pdfData, pdfType, documentTitle, handleDialogClose, tenant.brandName])

  return {
    isDownloading,
    downloadingId,
    downloadPdf,
    PdfRenderer,
  }
}
