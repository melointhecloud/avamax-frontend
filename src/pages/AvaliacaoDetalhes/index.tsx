import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ArrowLeft, MapPin, Home, Ruler, BedDouble, Bath, Car,
  Calendar, Download, Share2, FileText, Loader2,
  Sparkles,
  PlusCircle,
  Pencil,
  X,
  Save,
  RotateCcw,
  Users,
  ImagePlus,
  CheckCircle2,
  Key,
  Megaphone,
  ChevronDown,
  Clock,
  Presentation
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Imports do seu projeto
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { resolveEvaluationCoverUrl } from '@/services/evaluation-images.service'
import { getImageUrlForPdf, getMultipleImagesForPdf } from '@/lib/pdfImages'

// Componentes visuais da tela
import { ValueHeroSection } from './components/ValueHeroSection'
import { PropertyHighlights } from './components/PropertyHighlights'
import { MarketAnalysisChart } from './components/MarketAnalysisChart'
import { EvaluationTimeline } from './components/EvaluationTimeline'

// Importe o componente de preview de PDF e modo apresentação
import { PdfPreviewDialog } from '@/components/pdf/PdfPreviewDialog'
import { TenantPdfPreviewDialog } from '@/components/pdf/TenantPdfPreviewDialog'
import { useTenant } from '@/contexts/TenantContext'
import { PresentationMode } from '@/components/pdf/PresentationMode'
import { PdfReportEditor } from '@/components/pdf/PdfReportEditor'
import { PdfColorEditor, PDF_COLOR_PRESETS, type PdfColors } from '@/components/pdf/PdfColorEditor'
import { EvaluationResultDialog } from '@/components/evaluation/EvaluationResultDialog'
 import { ReselectSamplesDialog } from '@/components/evaluation/ReselectSamplesDialog'
import { EvaluationLoadingScreen } from '@/components/evaluation/EvaluationLoadingScreen'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import type { EvaluationResult, SimilarProperty } from '@/types/evaluation'
import { useQueryClient } from '@tanstack/react-query'
import confetti from 'canvas-confetti'

// Formata número para Real (R$) - usado para transformações
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
// Fire confetti celebration
const fireConfetti = () => {
  const duration = 2000
  const end = Date.now() + duration

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

const AvaliacaoDetalhes = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // Single-tenant AvaMax app: always the AvaMax brand.
  const isRemax = true
  const tenant = useTenant()
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  
  const [avaliacao, setAvaliacao] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [markingConverted, setMarkingConverted] = useState(false)
  const [captadoDialogOpen, setCaptadoDialogOpen] = useState(false)
  const [valorCaptado, setValorCaptado] = useState('')
  const [captadoExclusividade, setCaptadoExclusividade] = useState(false)
  const [captadoPrazo, setCaptadoPrazo] = useState<string>('')
  const [captadoComissao, setCaptadoComissao] = useState('')

  // ESTADO DO RELATÓRIO (Dados que vão pro PDF)
  const [reportData, setReportData] = useState<any>(null)
  const [rentalReportData, setRentalReportData] = useState<any>(null)
  // Estado para controlar o modal de edição
  const [isEditing, setIsEditing] = useState(false)
  // Estado para controlar o preview de PDF
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewType, setPdfPreviewType] = useState<'venda' | 'aluguel'>('venda')
  // Estado para controlar o modo apresentação
  const [presentationOpen, setPresentationOpen] = useState(false)

  // Estado para o modal de conclusão (fluxo normal)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [resultDialogData, setResultDialogData] = useState<{
    evaluationId: number;
    inputPayload: AvaliarImovelFormData;
    resultPayload: EvaluationResult;
  } | null>(null)
   // Estado para o diálogo de re-seleção de amostras
   const [reselectDialogOpen, setReselectDialogOpen] = useState(false)
  // Estado para tela de loading durante regeneração
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { id } = useParams()

  // Se a rota mudar (ex: após recálculo navegar para /avaliacao/novoId),
  // garante que o editor não fique aberto por reaproveitamento do componente.
  useEffect(() => {
    setIsEditing(false)
  }, [id])

  const rebuildReportsFromDb = () => {
    if (!avaliacao) return;

    const baseReport = transformDataToReport(avaliacao);
    const rentalReport = transformDataToRentalReport(avaliacao);

    // Preserva a capa já resolvida (storage) para não “sumir” após rebuild
    const resolvedCover = reportData?.property?.foto_capa;
    if (resolvedCover && baseReport?.property) baseReport.property.foto_capa = resolvedCover;
    if (resolvedCover && rentalReport?.property) rentalReport.property.foto_capa = resolvedCover;

    setReportData(baseReport);
    setRentalReportData(rentalReport);
  };

  const handleOpenPdfPreview = (type: 'venda' | 'aluguel') => {
    rebuildReportsFromDb()
    setPdfPreviewType(type)
    setPdfPreviewOpen(true)
  }

  // Abrir PDF Preview automaticamente via navigation state
  useEffect(() => {
    if (location.state?.openPdfPreview && avaliacao && !loading && String(avaliacao.id) === id) {
      setTimeout(() => {
        rebuildReportsFromDb()
        const tipo = (avaliacao.input as any)?.tipoAvaliacao === 'aluguel' ? 'aluguel' : 'venda'
        setPdfPreviewType(tipo as 'venda' | 'aluguel')
        setPdfPreviewOpen(true)
        navigate(location.pathname, { replace: true, state: {} })
      }, 100)
    }
  }, [location.state?.openPdfPreview, avaliacao, loading, id])

  // Efeito de animação de sucesso (nova avaliação)
  useEffect(() => {
   // Só abre o modal se:
   // 1. O state pede para abrir
   // 2. avaliacao está carregado
   // 3. Não está mais em loading (dados atualizados)
   // 4. O ID da avaliação corresponde ao id da URL (garante dados frescos)
   if (location.state?.openResultDialog && avaliacao && !loading && String(avaliacao.id) === id) {
      // Garante que o editor esteja fechado antes de abrir o modal de conclusão
      setIsEditing(false)
      // Abrir modal de conclusão automaticamente
      // (pequeno delay para evitar conflito de foco/stack com o editor)
      setTimeout(() => {
        openResultDialogFromAvaliacao(avaliacao)
        // Limpar state para não reabrir ao refresh/back
        navigate(location.pathname, { replace: true, state: {} })
      }, 50)
    } else if (location.state?.newEvaluation && !location.state?.openResultDialog) {
      // Apenas animação de sucesso sem modal
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => setShowSuccessAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
 }, [location.state, avaliacao, loading, id])

  // Helper para mapear avaliação do banco para payload do EvaluationResultDialog
  const openResultDialogFromAvaliacao = (avaliacaoData: any) => {
    const input = avaliacaoData.input as any
    const resultado = avaliacaoData.resultado as any
    
    // Mapear input para AvaliarImovelFormData
    // Nota: foto_capa não faz parte do schema Zod, mas está presente no input salvo
    const inputPayload = {
      estado: input.estado || '',
      municipio: input.municipio || '',
      bairro: input.bairro || '',
      rua: input.rua || '',
      categoria: input.categoria || '',
      areaTotal: Number(input.areaTotal) || Number(input.area) || 0,
      quartos: Number(input.quartos) || 0,
      suites: Number(input.suites) || 0,
      banheiros: Number(input.banheiros) || 0,
      vagas: Number(input.vagas) || 0,
      tipoAvaliacao: input.tipoAvaliacao || 'venda',
      foto_capa: input.foto_capa,
      // Campos opcionais
      cep: input.cep,
      condominio: input.condominio,
      iptu: input.iptu,
      aVenda: input.aVenda,
      linkVenda: input.linkVenda,
      mobiliado: input.mobiliado,
      situacaoLegal: input.situacaoLegal,
      locaisProximos: input.locaisProximos,
      descricao: input.descricao,
      avaliacaoTecnica: input.avaliacaoTecnica,
      localizacao: input.localizacao,
      planta: input.planta,
      acabamentos: input.acabamentos,
      conservacao: input.conservacao,
      areasComuns: input.areasComuns,
      features: input.features || { selected: [] },
      especificacoes: input.especificacoes,
      clienteAtivo: input.clienteAtivo,
      clienteNome: input.clienteNome,
      clienteEmail: input.clienteEmail,
      clienteTelefone: input.clienteTelefone,
    } as AvaliarImovelFormData & { foto_capa?: string }
    
    // Mapear similares do banco para SimilarProperty[]
    const similares = (resultado.similares || []).map((s: any, index: number) => ({
      id: Number(s.id) || index,
      titulo: s.raw?.Categoria || s.raw?.Titulo || `Amostra ${index + 1}`,
      descricao: s.raw?.Descricao || '',
      valor: Number(s.valor) || 0,
      area: Number(s.raw?.Metros) || 0,
      quartos: Number(s.raw?.Quartos) || 0,
      banheiros: Number(s.raw?.Banheiros) || 0,
      vagas: Number(s.raw?.Vagas) || 0,
      imagem: s.raw?.Midia_Imovel || '',
      raw: s.raw
    }))
    
    // Construir EvaluationResult
    const area = Number(input.areaTotal) || Number(input.area) || 1
    const resultPayload = {
      id: avaliacaoData.id,
      valor_estimado: Number(resultado.valor_estimado) || 0,
      confianca: Number(resultado.confianca) || 0.85,
      minimo: Number(resultado.minimo) || 0,
      maximo: Number(resultado.maximo) || 0,
      valor_m2: resultado.valor_m2 || (resultado.valor_estimado / area),
      similares
    } as EvaluationResult
    
    setResultDialogData({
      evaluationId: avaliacaoData.id,
      inputPayload: inputPayload as AvaliarImovelFormData,
      resultPayload
    })
    setResultDialogOpen(true)
  }

  // --- FUNÇÃO ADAPTER (Extrai dados do banco e formata para o PDF) ---
  // Agora é uma função pura que retorna os dados, para ser usada no load e no reset
  const transformDataToReport = (data: any) => {
    if (!data) return null;

    const { input, resultado } = data;
    const valEstimado = resultado.valor_estimado || 0;
    
    // Carrega configurações salvas do PDF (se existirem)
    const pdfSettings = resultado.pdf_settings || {};
    const savedMarket = pdfSettings.market || {};
    const savedSettings = pdfSettings.settings || {};
    const savedClient = pdfSettings.client;
    const savedBroker = pdfSettings.broker;

    const selectedFeatures = Array.isArray(input?.features)
      ? input.features
      : Array.isArray(input?.features?.selected)
        ? input.features.selected
        : []

    // Usa valores salvos se existirem, senão usa originais
    const finalValorEstimado = savedMarket.valor_estimado ?? valEstimado;
    const finalMinimo = savedMarket.minimo ?? (resultado.minimo || valEstimado * 0.9);
    const finalMaximo = savedMarket.maximo ?? (resultado.maximo || valEstimado * 1.1);
    
    // Usa similares salvos se existirem (preserva ordem personalizada)
    const savedSimilares = savedMarket.similares;

    const brokerFromProfile = profile
      ? {
          nome: profile.nome,
          email: profile.email,
          creci: profile.creci,
          avatar_url: profile.avatar_url,
          imobiliaria: profile.imobiliaria,
          logo_imobiliaria_url: profile.logo_imobiliaria_url,
          signature_url: profile.signature_url,
          telefone: profile.telefone,
        }
      : undefined;

    const brokerMerged = savedBroker
      ? brokerFromProfile
        ? {
            ...brokerFromProfile,
            ...savedBroker,
            // garante que a assinatura do perfil não se perca quando houver broker salvo no editor
            signature_url:
              (savedBroker as any)?.signature_url ?? brokerFromProfile.signature_url,
          }
        : savedBroker
      : brokerFromProfile;

    return {
      clientName: input?.clienteNome || profile?.nome || user?.email || 'Cliente Avaluz',
      // Dados do cliente - usa salvos se existirem
      client: savedClient ?? (input?.clienteAtivo && input?.clienteNome ? {
        nome: input.clienteNome,
        email: input.clienteEmail || undefined,
        telefone: input.clienteTelefone || undefined,
      } : undefined),
      property: {
        id: data.id,
        rua: input.rua || '',
        bairro: input.bairro || '',
        municipio: input.municipio || '',
        estado: input.estado || '',
        area: Number(input.areaTotal) || Number(input.area) || 0,
        quartos: Number(input.quartos) || 0,
        suites: Number(input.suites) || 0,
        banheiros: Number(input.banheiros) || 0,
        vagas: Number(input.vagas) || 0,
        valor_atual: Number(input.valor) || valEstimado,
        tipo: input.categoria || 'Imóvel',
        foto_capa: input.foto_capa || null,
        // Dados extras do formulário
        cep: input.cep || undefined,
        condominio: input.condominio || undefined,
        iptu: input.iptu || undefined,
        aVenda: input.aVenda || false,
        linkVenda: input.linkVenda || undefined,
        mobiliado: input.mobiliado || undefined,
        situacaoLegal: input.situacaoLegal || undefined,
        locaisProximos: input.locaisProximos || undefined,
        descricao: input.descricao || undefined,
        // Avaliações (1-5)
        avaliacaoTecnica: input.avaliacaoTecnica || undefined,
        localizacao: input.localizacao || undefined,
        planta: input.planta || undefined,
        acabamentos: input.acabamentos || undefined,
        conservacao: input.conservacao || undefined,
        areasComuns: input.areasComuns || undefined,
        // Features selecionadas
        features: selectedFeatures,
        // Especificações do tipo
        especificacoes: input.especificacoes || undefined,
      },
      market: {
        valor_estimado: finalValorEstimado,
        confianca: resultado.confianca || 0.85,
        amostras: resultado.similares?.length || 0,
        minimo: finalMinimo,
        medio: finalValorEstimado,
        maximo: finalMaximo,
        similares: savedSimilares || (resultado.similares || []).map((s: any, index: number) => {
          const raw = s.raw || {};

          // Extrai descrição completa de forma mais robusta
          let descricaoCompleta = '';
          if (raw.Descricao) {
            descricaoCompleta = String(raw.Descricao)
              .replace(/<[^>]*>?/gm, '') // Remove HTML tags
              .replace(/\s+/g, ' ')       // Normaliza espaços
              .trim();
            // Descrição completa - truncagem visual controlada pelo CSS do PDF (line-clamp)
          }

          return {
            id: s.id || index,
            titulo: raw.Titulo || raw.Categoria || `Amostra ${index + 1}`,
            categoria: raw.Categoria || null,
            descricao: descricaoCompleta || 'Descrição não disponível.',
            valor: s.valor || 0,
            area: Number(raw.Metros) || 0,
            quartos: Number(raw.Quartos) || 0,
            suites: Number(raw.Suites) || 0,
            banheiros: Number(raw.Banheiros) || 0,
            vagas: Number(raw.Vagas) || 0,
            imagem: getImageUrlForPdf(raw.Midia_Imovel),
            imagens: getMultipleImagesForPdf(raw.Midia_Imovel, 4),
            status: (raw.Status && String(raw.Status).toLowerCase().includes('vendido')) ? 'vendido' : 'ativo',
            // Dados de localização
            rua: raw.Rua || null,
            bairro: raw.Bairro || null,
            municipio: raw.Municipio || null,
            estado: raw.Estado || null,
            link: raw.Link || null
          };
        })
      },
      // Dados do corretor (merge: perfil + overrides do editor)
      broker: brokerMerged,
      // Configurações do PDF - usa salvas se existirem
      settings: {
        showMinimo: savedSettings.showMinimo ?? true,
        showMaximo: savedSettings.showMaximo ?? true,
        showMarketingPlan: savedSettings.showMarketingPlan ?? true,
        marketingPlan: savedSettings.marketingPlan,
        showClient: savedSettings.showClient ?? true,
        showClientEmail: savedSettings.showClientEmail ?? true,
        showClientPhone: savedSettings.showClientPhone ?? true,
        showBrokerContact: savedSettings.showBrokerContact ?? true,
        pdfColors: savedSettings.pdfColors,
      }
    };
  };

  // Função para transformar dados de ALUGUEL (calcula valores de locação)
  const transformDataToRentalReport = (data: any) => {
    if (!data) return null;

    const { input, resultado } = data;
    const valEstimadoVenda = resultado.valor_estimado || 0;
    
    // Calcula valor de aluguel: ~0,5% do valor de venda (regra de mercado)
    const taxaAluguel = 0.005;
    const aluguelEstimado = Math.round(valEstimadoVenda * taxaAluguel);
    const aluguelMinimo = Math.round(aluguelEstimado * 0.85);
    const aluguelMaximo = Math.round(aluguelEstimado * 1.15);
    
    // Carrega configurações salvas do PDF (se existirem)
    const pdfSettings = resultado.pdf_settings_aluguel || {};
    const savedMarket = pdfSettings.market || {};
    const savedSettings = pdfSettings.settings || {};
    const savedClient = pdfSettings.client;
    const savedBroker = pdfSettings.broker;

    const selectedFeatures = Array.isArray(input?.features)
      ? input.features
      : Array.isArray(input?.features?.selected)
        ? input.features.selected
        : []

    // Usa valores salvos se existirem, senão usa calculados
    const finalAluguelEstimado = savedMarket.valor_estimado ?? aluguelEstimado;
    const finalMinimo = savedMarket.minimo ?? aluguelMinimo;
    const finalMaximo = savedMarket.maximo ?? aluguelMaximo;
    
    // Usa similares salvos se existirem (preserva ordem personalizada)
    const savedSimilaresAluguel = savedMarket.similares;

    const brokerFromProfile = profile
      ? {
          nome: profile.nome,
          email: profile.email,
          creci: profile.creci,
          avatar_url: profile.avatar_url,
          imobiliaria: profile.imobiliaria,
          logo_imobiliaria_url: profile.logo_imobiliaria_url,
          signature_url: profile.signature_url,
          telefone: profile.telefone,
        }
      : undefined;

    const brokerMerged = savedBroker
      ? brokerFromProfile
        ? {
            ...brokerFromProfile,
            ...savedBroker,
            signature_url:
              (savedBroker as any)?.signature_url ?? brokerFromProfile.signature_url,
          }
        : savedBroker
      : brokerFromProfile;

    return {
      clientName: input?.clienteNome || profile?.nome || user?.email || 'Cliente Avaluz',
      client: savedClient ?? (input?.clienteAtivo && input?.clienteNome ? {
        nome: input.clienteNome,
        email: input.clienteEmail || undefined,
        telefone: input.clienteTelefone || undefined,
      } : undefined),
      property: {
        id: data.id,
        rua: input.rua || '',
        bairro: input.bairro || '',
        municipio: input.municipio || '',
        estado: input.estado || '',
        area: Number(input.areaTotal) || Number(input.area) || 0,
        quartos: Number(input.quartos) || 0,
        suites: Number(input.suites) || 0,
        banheiros: Number(input.banheiros) || 0,
        vagas: Number(input.vagas) || 0,
        valor_atual: finalAluguelEstimado,
        tipo: input.categoria || 'Imóvel',
        foto_capa: input.foto_capa || null,
        cep: input.cep || undefined,
        condominio: input.condominio || undefined,
        iptu: input.iptu || undefined,
        aVenda: input.aVenda || false,
        linkVenda: input.linkVenda || undefined,
        mobiliado: input.mobiliado || undefined,
        situacaoLegal: input.situacaoLegal || undefined,
        locaisProximos: input.locaisProximos || undefined,
        descricao: input.descricao || undefined,
        avaliacaoTecnica: input.avaliacaoTecnica || undefined,
        localizacao: input.localizacao || undefined,
        planta: input.planta || undefined,
        acabamentos: input.acabamentos || undefined,
        conservacao: input.conservacao || undefined,
        areasComuns: input.areasComuns || undefined,
        features: selectedFeatures,
        especificacoes: input.especificacoes || undefined,
      },
      market: {
        valor_estimado: finalAluguelEstimado,
        confianca: resultado.confianca || 0.85,
        amostras: resultado.similares?.length || 0,
        minimo: finalMinimo,
        medio: finalAluguelEstimado,
        maximo: finalMaximo,
        similares: savedSimilaresAluguel || (resultado.similares || []).map((s: any, index: number) => {
          const raw = s.raw || {};

          let descricaoCompleta = '';
          if (raw.Descricao) {
            descricaoCompleta = String(raw.Descricao)
              .replace(/<[^>]*>?/gm, '')
              .replace(/\s+/g, ' ')
              .trim();
            // Descrição completa - truncagem visual controlada pelo CSS do PDF (line-clamp)
          }

          // Calcula valor de aluguel das amostras também
          const valorVenda = s.valor || 0;
          const valorAluguel = Math.round(valorVenda * taxaAluguel);

          return {
            id: s.id || index,
            titulo: raw.Titulo || raw.Categoria || `Amostra ${index + 1}`,
            categoria: raw.Categoria || null,
            descricao: descricaoCompleta || 'Descrição não disponível.',
            valor: valorAluguel, // Usa valor de aluguel
            area: Number(raw.Metros) || 0,
            quartos: Number(raw.Quartos) || 0,
            suites: Number(raw.Suites) || 0,
            banheiros: Number(raw.Banheiros) || 0,
            vagas: Number(raw.Vagas) || 0,
            imagem: getImageUrlForPdf(raw.Midia_Imovel),
            imagens: getMultipleImagesForPdf(raw.Midia_Imovel, 4),
            status: (raw.Status && String(raw.Status).toLowerCase().includes('vendido')) ? 'vendido' : 'ativo',
            // Dados de localização
            rua: raw.Rua || null,
            bairro: raw.Bairro || null,
            municipio: raw.Municipio || null,
            estado: raw.Estado || null,
            link: raw.Link || null
          };
        })
      },
      broker: brokerMerged,
      settings: {
        showMinimo: savedSettings.showMinimo ?? true,
        showMaximo: savedSettings.showMaximo ?? true,
        showMarketingPlan: savedSettings.showMarketingPlan ?? true,
        marketingPlan: savedSettings.marketingPlan,
        showClient: savedSettings.showClient ?? true,
        showClientEmail: savedSettings.showClientEmail ?? true,
        showClientPhone: savedSettings.showClientPhone ?? true,
        showBrokerContact: savedSettings.showBrokerContact ?? true,
        showRentalTime: savedSettings.showRentalTime ?? true,
        rentalTimeText: savedSettings.rentalTimeText,
        rentalTimeDescription: savedSettings.rentalTimeDescription,
        pdfColors: savedSettings.pdfColors,
      }
    };
  };

  // Carregar dados
  useEffect(() => {
    const fetchAvaliacao = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (error) {
        console.error(error)
        setError('Avaliação não encontrada')
        navigate('/historico')
        return
      }

      // Busca dados completos dos imóveis similares
      const resultado = data.resultado as any;
      const similares = resultado?.similares || [];
      const similarIds = similares.map((s: any) => s.id).filter(Boolean);

      if (similarIds.length > 0) {
        const { data: imoveisCompletos } = await supabase
          .from('imoveis')
          .select('id, Quartos, Banheiros, Vagas, Descricao')
          .in('id', similarIds);

        // Enriquece os dados dos similares com as informações completas
        if (imoveisCompletos) {
          const imoveisMap = new Map(imoveisCompletos.map(i => [i.id, i]));
          similares.forEach((s: any) => {
            const imovelCompleto = imoveisMap.get(s.id);
            if (imovelCompleto) {
              s.raw = {
                ...s.raw,
                Quartos: imovelCompleto.Quartos,
                Banheiros: imovelCompleto.Banheiros,
                Vagas: imovelCompleto.Vagas,
                Descricao: imovelCompleto.Descricao || s.raw?.Descricao
              };
            }
          });
        }
      }

      setAvaliacao(data)

      // Inicializa os dados dos relatórios com os dados do banco + resolve capa no storage
      const baseReport = transformDataToReport(data)
      const rentalReport = transformDataToRentalReport(data)
      
      if (baseReport && data?.user_id) {
        const resolvedCover = await resolveEvaluationCoverUrl({
          userId: data.user_id,
          evaluationId: data.id,
          evaluationCreatedAt: data.created_at,
          fallbackUrl: baseReport.property?.foto_capa,
        })
        baseReport.property.foto_capa = resolvedCover
        if (rentalReport) {
          rentalReport.property.foto_capa = resolvedCover
        }
      }
      
      setReportData(baseReport)
      setRentalReportData(rentalReport)

      setLoading(false)
    }

    if (id) fetchAvaliacao()
  }, [id, profile])

  // Handlers do Editor
  const handleSaveReport = async (newData: any) => {
    if (!avaliacao?.id) return;
    
    try {
      const isRentalType = (avaliacao.input as any)?.tipoAvaliacao === 'aluguel';
      
      // Prepara os dados para salvar no campo resultado
      const updatedResultado = {
        ...(avaliacao.resultado as any),
      };
      
      if (isRentalType) {
        // Salva em pdf_settings_aluguel para avaliações de aluguel
        updatedResultado.pdf_settings_aluguel = {
          market: {
            valor_estimado: newData.market?.valor_estimado,
            minimo: newData.market?.minimo,
            maximo: newData.market?.maximo,
            similares: newData.market?.similares,
          },
          settings: newData.settings,
          client: newData.client,
          broker: newData.broker,
        };
      } else {
        // Salva em pdf_settings para avaliações de venda
        updatedResultado.pdf_settings = {
          market: {
            valor_estimado: newData.market?.valor_estimado,
            minimo: newData.market?.minimo,
            maximo: newData.market?.maximo,
            similares: newData.market?.similares,
          },
          settings: newData.settings,
          client: newData.client,
          broker: newData.broker,
        };
      }

      const { error } = await supabase
        .from('avaliacoes')
        .update({ resultado: updatedResultado })
        .eq('id', avaliacao.id);

      if (error) throw error;

      // Atualiza estado local com cópia profunda para garantir re-render
      const updatedAvaliacao = {
        ...avaliacao,
        resultado: { ...updatedResultado }
      };
      setAvaliacao(updatedAvaliacao);
      
      // Atualiza os dados do relatório também
      if (isRentalType) {
        setRentalReportData({ ...newData });
      } else {
        setReportData({ ...newData });
      }
      
      setIsEditing(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      toast.error(err.message || 'Erro ao salvar alterações');
    }
  };

  const handleResetReport = async () => {
    if (!avaliacao) return;
    
    try {
      const isRentalType = (avaliacao.input as any)?.tipoAvaliacao === 'aluguel';
      
      // Remove pdf_settings do resultado
      const updatedResultado = { ...(avaliacao.resultado as any) };
      
      if (isRentalType) {
        delete updatedResultado.pdf_settings_aluguel;
      } else {
        delete updatedResultado.pdf_settings;
      }

      const { error } = await supabase
        .from('avaliacoes')
        .update({ resultado: updatedResultado })
        .eq('id', avaliacao.id);

      if (error) throw error;

      // Atualiza estado local
      setAvaliacao((prev: any) => ({
        ...prev,
        resultado: updatedResultado
      }));
      
      if (isRentalType) {
        const rentalReport = transformDataToRentalReport({ ...avaliacao, resultado: updatedResultado });
        setRentalReportData(rentalReport);
      } else {
        const baseReport = transformDataToReport({ ...avaliacao, resultado: updatedResultado });
        setReportData(baseReport);
      }
      
      toast.info("Dados restaurados para o original.");
    } catch (err: any) {
      console.error('Erro ao resetar:', err);
      toast.error(err.message || 'Erro ao restaurar dados');
    }
  };

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: `Avaliação`, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    }
  }

  const handleToggleConverted = async () => {
    if (!avaliacao?.id) return;

    // Se já está captado, apenas desmarca
    if (avaliacao.convertido) {
      setMarkingConverted(true);
      try {
        // RPC ausente dos tipos gerados do Supabase (migration 20260529010000).
        // Cast até regenerar os tipos com `supabase gen types`.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ok, error } = await supabase.rpc('update_avaliacao_captado' as any, {
          p_avaliacao_id: avaliacao.id,
          p_convertido: false,
        });
        if (error) throw error;
        if (!ok) throw new Error('Não foi possível salvar. Tente novamente.');
        setAvaliacao((prev: any) => ({ ...prev, convertido: false, valor_captado: null, captado_exclusividade: null, captado_prazo: null, captado_comissao: null }));
        toast.success('Captação desmarcada');
      } catch (err: any) {
        toast.error(err.message || 'Erro ao atualizar status');
      } finally {
        setMarkingConverted(false);
      }
      return;
    }

    // Se não está captado, abre o dialog para informar valor
    setCaptadoDialogOpen(true);
    setValorCaptado('');
    setCaptadoExclusividade(false);
    setCaptadoPrazo('');
    setCaptadoComissao('');
  }

  const handleConfirmCaptado = async () => {
    if (!avaliacao?.id) return;

    const valorNumerico = valorCaptado
      ? Number(valorCaptado.replace(/\D/g, ''))
      : null;
    const prazoNumerico = captadoPrazo ? Number(captadoPrazo) : null;
    const comissaoNumerica = captadoComissao ? Number(captadoComissao.replace(',', '.')) : null;

    setMarkingConverted(true);
    setCaptadoDialogOpen(false);
    try {
      // RPC ausente dos tipos gerados do Supabase (migration 20260529010000).
      // Cast até regenerar os tipos com `supabase gen types`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ok, error } = await supabase.rpc('update_avaliacao_captado' as any, {
        p_avaliacao_id:  avaliacao.id,
        p_convertido:    true,
        p_valor_captado: valorNumerico,
        p_exclusividade: captadoExclusividade,
        p_prazo:         prazoNumerico,
        p_comissao:      comissaoNumerica,
      });
      if (error) throw error;
      if (!ok) throw new Error('Não foi possível salvar. Tente novamente.');
      setAvaliacao((prev: any) => ({ 
        ...prev, 
        convertido: true, 
        valor_captado: valorNumerico,
        captado_exclusividade: captadoExclusividade,
        captado_prazo: prazoNumerico,
        captado_comissao: comissaoNumerica,
      }));
      toast.success('Imóvel marcado como captado! 🎉');
      fireConfetti();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status');
    } finally {
      setMarkingConverted(false);
    }
  }

  const handleValorCaptadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setValorCaptado(''); return; }
    const num = Number(raw) / 100;
    setValorCaptado(num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  }

  // --- RENDERS ---

  if (loading) {
    return (
      <DashboardLayout title="Detalhes da Avaliação" subtitle="Carregando...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !avaliacao) return <DashboardLayout title="Erro" subtitle="Erro"><div/></DashboardLayout>

  const { input, resultado: resultadoRaw } = avaliacao
  
  // Cast para acessar campos dinâmicos do resultado
  const resultado = resultadoRaw as any
  
  // Helper para obter valores editados ou originais
  const isRental = input?.tipoAvaliacao === 'aluguel'
  const taxaAluguel = 0.005
  
  // Valor de venda (editado ou original)
  const valorVendaEditado = resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado
  
  // Valor de aluguel (editado ou calculado)
  const valorAluguelEditado = resultado?.pdf_settings_aluguel?.market?.valor_estimado ?? 
    (valorVendaEditado ? Math.round(valorVendaEditado * taxaAluguel) : undefined)
  
  // Valores para exibição baseado no tipo
  const valorPrincipal = isRental ? valorAluguelEditado : valorVendaEditado
  const valorSecundario = isRental ? valorVendaEditado : valorAluguelEditado
  
  // Valor por m²
  const area = input?.areaTotal || input?.area || 1
  const valorM2Venda = valorVendaEditado ? valorVendaEditado / area : resultado?.valor_m2
  const valorM2Aluguel = valorAluguelEditado ? valorAluguelEditado / area : undefined
  const valorM2Display = isRental ? valorM2Aluguel : valorM2Venda

  return (
    <DashboardLayout title="Detalhes da Avaliação" subtitle="Visualize os detalhes completos">
      <div className="space-y-6 relative">
        
        {/* MODAL DE EDIÇÃO */}
        {isEditing && (isRental ? rentalReportData : reportData) && (
          <PdfReportEditor 
            data={isRental ? rentalReportData : reportData} 
            onSave={handleSaveReport} 
            onCancel={() => setIsEditing(false)}
            onReset={handleResetReport}
            isRental={isRental}
            evaluationId={avaliacao?.id}
             onRequestReselectSamples={() => {
               // Fecha o editor e abre o dialog de re-seleção
              setIsEditing(false);
               setReselectDialogOpen(true);
            }}
          />
        )}

         {/* MODAL DE RE-SELEÇÃO DE AMOSTRAS */}
         {(reselectDialogOpen || isRegenerating) && avaliacao && (
           <ReselectSamplesDialog
             open={reselectDialogOpen}
             onOpenChange={setReselectDialogOpen}
             samples={(avaliacao.resultado as any)?.similares || []}
              currentSelectedIds={((avaliacao.resultado as any)?.similares || []).map((s: any) => Number(s.id))}
             evaluationId={avaliacao.id}
             tipoAvaliacao={(avaliacao.input as any)?.tipoAvaliacao || 'venda'}
              evaluationInput={{
                estado: (avaliacao.input as any)?.estado || '',
                municipio: (avaliacao.input as any)?.municipio || '',
                bairro: (avaliacao.input as any)?.bairro || '',
                 rua: (avaliacao.input as any)?.rua,
                categoria: (avaliacao.input as any)?.categoria || '',
                areaTotal: (avaliacao.input as any)?.areaTotal,
                area: (avaliacao.input as any)?.area,
                quartos: (avaliacao.input as any)?.quartos,
                banheiros: (avaliacao.input as any)?.banheiros,
                vagas: (avaliacao.input as any)?.vagas,
              }}
             onLoadingChange={setIsRegenerating}
             onSuccess={(payload) => {
               setReselectDialogOpen(false);
               setIsRegenerating(false);
               // Navegar para a nova avaliação e abrir modal de conclusão
               setTimeout(() => {
                 navigate(`/avaliacao/${payload.avaliacaoId}`, {
                   state: { 
                     newEvaluation: true, 
                     openResultDialog: true,
                     // Passa os dados da nova avaliação diretamente no state
                     regeneratedData: payload
                   },
                 });
               }, 0);
             }}
           />
         )}

        {/* Tela de Loading durante regeneração */}
        <EvaluationLoadingScreen isOpen={isRegenerating} />

        {/* Animação de Sucesso */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-4 text-center animate-scale-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <Sparkles className="h-10 w-10 text-success animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold">Avaliação Concluída!</h2>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/historico')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Relatório de Avaliação</h1>
                <Badge className={input?.tipoAvaliacao === 'aluguel' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300'
                }>
                  {input?.tipoAvaliacao === 'aluguel' ? 'Aluguel' : 'Venda'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">#{avaliacao.id} • {format(new Date(avaliacao.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Botão de Convertido - agora é toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleConverted}
              disabled={markingConverted}
              className={avaliacao.convertido 
                ? "border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300" 
                : "border-green-500/50 text-green-400 hover:bg-green-500/20 hover:text-green-300"
              }
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> 
              {markingConverted ? 'Atualizando...' : (avaliacao.convertido ? 'Captado ✓' : 'Marcar Captado')}
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            
            {/* BOTÃO DE EDITAR */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                rebuildReportsFromDb();
                setIsEditing(true);
              }}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
            >
              <Pencil className="mr-2 h-4 w-4" /> Editar PDF
            </Button>

            {/* BOTÃO DE APRESENTAR - Abre slideshow fullscreen */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                rebuildReportsFromDb();
                setPresentationOpen(true);
              }}
              className={input?.tipoAvaliacao === 'aluguel' 
                ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300" 
                : "border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
              }
            >
              <Presentation className="mr-2 h-4 w-4" /> Apresentar
            </Button>

            {/* Botão de PDF - RE/MAX usa dialog próprio */}
            {isRemax ? (
              <Button 
                size="sm" 
                onClick={() => handleOpenPdfPreview(input?.tipoAvaliacao === 'aluguel' ? 'aluguel' : 'venda')} 
                className="text-white"
                style={{ backgroundColor: '#CC0000' }}
              >
                <Download className="mr-2 h-4 w-4" /> PDF AvaMax
              </Button>
            ) : (
              <>
              {/* 
                TEMPORARIAMENTE DESABILITADO - Botões de download de PDF
                Reativar após correção do html2canvas
                
                {input?.tipoAvaliacao === 'aluguel' ? (
                  <Button size="sm" onClick={() => handleOpenPdfPreview('aluguel')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Key className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">PDF</span> Aluguel
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleOpenPdfPreview('venda')} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Download className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">PDF</span> Venda
                  </Button>
                )}
              */}
              </>
            )}
          </div>
        </div>

        {/* --- VISUALIZAÇÃO PADRÃO DA TELA (Usa valores editados) --- */}
        <ValueHeroSection
          valorEstimado={valorPrincipal}
          valorM2={valorM2Display}
          confianca={resultado?.confianca}
          comparativos={resultado?.comparativos}
          bairro={input?.bairro}
          municipio={input?.municipio}
          estado={input?.estado}
          isRental={isRental}
        />

        {/* Card com Preço do M² e Estimativa Secundária */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Card de Preço por m² */}
          <Card className={isRental 
            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
            : "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          }>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isRental ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                <Ruler className={`h-6 w-6 ${isRental ? 'text-emerald-600' : 'text-primary'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRental ? 'Preço por m² (mensal)' : 'Preço por m²'}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isRental ? (
                    valorM2Aluguel 
                      ? `R$ ${Math.round(valorM2Aluguel).toLocaleString('pt-BR')}/mês`
                      : '-'
                  ) : (
                    valorM2Venda 
                      ? `R$ ${Math.round(valorM2Venda).toLocaleString('pt-BR')}`
                      : '-'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Estimativa Secundária (invertido baseado no tipo) */}
          <Card className={isRental 
            ? "border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent"
            : "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
          }>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isRental ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>
                {isRental ? (
                  <Home className="h-6 w-6 text-orange-600" />
                ) : (
                  <Key className="h-6 w-6 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRental ? 'Estimativa de Venda' : 'Estimativa de Aluguel'}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isRental ? (
                    valorSecundario 
                      ? `R$ ${Math.round(valorSecundario).toLocaleString('pt-BR')}`
                      : '-'
                  ) : (
                    valorSecundario 
                      ? `R$ ${Math.round(valorSecundario).toLocaleString('pt-BR')}/mês`
                      : '-'
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRental 
                    ? '~200x o valor do aluguel'
                    : '~0,5% do valor do imóvel'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MarketAnalysisChart
            valorEstimado={isRental ? valorAluguelEditado : valorVendaEditado}
            valorM2={isRental ? valorM2Aluguel : valorM2Venda}
            bairro={input?.bairro}
          />
          <PropertyHighlights
            area={input?.area || input?.areaTotal}
            quartos={input?.quartos}
            bairro={input?.bairro}
            valorM2={isRental ? valorM2Aluguel : valorM2Venda}
          />
        </div>

        {/* Card de Foto da Fachada - CTA quando não há foto */}
        {!reportData?.property?.foto_capa && (
          <Card 
            className="border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all group"
            onClick={() => {
              rebuildReportsFromDb();
              setIsEditing(true);
            }}
          >
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ImagePlus className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-foreground">Adicionar foto da fachada</p>
                <p className="text-sm text-muted-foreground">
                  Clique aqui para personalizar o PDF com uma foto do imóvel
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 sm:ml-auto">
                <ImagePlus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Home className="h-4 w-4 text-primary sm:h-5 sm:w-5" /> Dados do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Preview da foto de fachada quando existe */}
              {reportData?.property?.foto_capa && (
                <>
                  <div 
                    className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setIsEditing(true)}
                  >
                    <img 
                      src={reportData.property.foto_capa} 
                      alt="Fachada do imóvel" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-sm font-medium flex items-center gap-1">
                        <Pencil size={14} />
                        Alterar foto
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              <DetailRow icon={<MapPin/>} label="Localização" value={`${input?.bairro}, ${input?.municipio}`} />
              <Separator />
              <DetailRow icon={<Home/>} label="Categoria" value={input?.categoria} />
              <Separator />
              <DetailRow icon={<Ruler/>} label="Área" value={`${input?.area || input?.areaTotal || '-'} m²`} />
              <Separator />
              <DetailRow icon={<BedDouble/>} label="Quartos" value={input?.quartos || '-'} />
              <Separator />
              <DetailRow icon={<Bath/>} label="Banheiros" value={input?.banheiros || '-'} />
              <Separator />
              <DetailRow icon={<Car/>} label="Vagas" value={input?.vagas || '-'} />
            </CardContent>
          </Card>

          <EvaluationTimeline 
            createdAt={avaliacao.created_at} 
            avaliacaoId={avaliacao.id} 
          />
        </div>

        {/* Informações da Avaliação */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" /> Informações da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="mt-1 font-mono text-lg font-semibold">#{avaliacao.id}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="mt-1 text-lg font-semibold">{format(new Date(avaliacao.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Créditos</p>
                <p className="mt-1 text-lg font-semibold">{avaliacao.creditos_consumidos}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className="mt-1 bg-success hover:bg-success/90">Concluída</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-lg font-semibold">Precisa de uma nova avaliação?</p>
              <p className="text-sm text-muted-foreground">Realize uma nova avaliação com dados atualizados</p>
            </div>
            <Button onClick={() => navigate('/avaliar')} size="lg" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Nova Avaliação
            </Button>
          </CardContent>
        </Card>

        {/* PDF Preview Dialog - Conditional: RE/MAX or Avaluz */}
        {isRemax ? (
          <TenantPdfPreviewDialog
            open={pdfPreviewOpen}
            onClose={() => setPdfPreviewOpen(false)}
            reportData={pdfPreviewType === 'aluguel' ? rentalReportData : reportData}
            reportType={pdfPreviewType}
            companyName={tenant.brandName}
            documentTitle={`Estudo_Mercado_${tenant.brandName}_${avaliacao?.id || ''}`}
          />
        ) : (
          <PdfPreviewDialog
            open={pdfPreviewOpen}
            onClose={() => setPdfPreviewOpen(false)}
            reportData={pdfPreviewType === 'aluguel' ? rentalReportData : reportData}
            reportType={pdfPreviewType}
            documentTitle={`Avaliacao_${pdfPreviewType === 'aluguel' ? 'Aluguel' : 'Venda'}_Avaluz_${avaliacao?.id || ''}`}
          />
        )}

        {/* Presentation Mode - Slideshow fullscreen */}
        <PresentationMode
          open={presentationOpen}
          onClose={() => setPresentationOpen(false)}
          reportData={input?.tipoAvaliacao === 'aluguel' ? rentalReportData : reportData}
          reportType={input?.tipoAvaliacao === 'aluguel' ? 'aluguel' : 'venda'}
          isRemax={isRemax}
        />

        {/* Modal de Conclusão (fluxo normal) */}
        {resultDialogData && (
          <EvaluationResultDialog
            open={resultDialogOpen}
            onOpenChange={(open) => {
              setResultDialogOpen(open)
              if (!open) {
                setResultDialogData(null)
              }
            }}
            evaluationId={resultDialogData.evaluationId}
            inputPayload={resultDialogData.inputPayload}
            resultPayload={resultDialogData.resultPayload}
          />
        )}

      </div>

      {/* Dialog de Valor Captado */}
      <Dialog open={captadoDialogOpen} onOpenChange={setCaptadoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dados da Captação</DialogTitle>
            <DialogDescription>
              Preencha os dados do contrato de captação. Essas informações serão salvas para análises futuras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="valor-captado">Valor captado (R$)</Label>
              <Input
                id="valor-captado"
                placeholder="R$ 0,00"
                value={valorCaptado}
                onChange={handleValorCaptadoChange}
                className="mt-2"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="exclusividade" className="cursor-pointer">Exclusividade</Label>
              <Switch
                id="exclusividade"
                checked={captadoExclusividade}
                onCheckedChange={setCaptadoExclusividade}
              />
            </div>

            <div>
              <Label htmlFor="prazo">Prazo do contrato</Label>
              <Select value={captadoPrazo} onValueChange={setCaptadoPrazo}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="180">180 dias</SelectItem>
                  <SelectItem value="360">360 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comissao">Taxa de comissão (%)</Label>
              <Input
                id="comissao"
                placeholder="Ex: 6"
                value={captadoComissao}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setCaptadoComissao(val);
                }}
                className="mt-2"
                inputMode="decimal"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaptadoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCaptado} disabled={!valorCaptado}>
              Confirmar Captação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}

// Subcomponente
const DetailRow = ({ icon, label, value }: any) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
      {icon && React.cloneElement(icon, { className: "h-4 w-4 flex-shrink-0" })}
      <span className="text-sm">{label}</span>
    </div>
    <span className="truncate text-right text-sm font-medium">{value}</span>
  </div>
);

export default AvaliacaoDetalhes