/**
 * Tipos compartilhados para PDF Nativo (@react-pdf/renderer)
 * 
 * Esses tipos espelham as interfaces do sistema DOM (src/pages/Pdf/index.tsx)
 * para garantir compatibilidade entre os dois sistemas de renderização.
 */

import { PdfColorScheme } from './tokens';

// ============= DADOS DO CLIENTE =============

export interface ClientData {
  nome: string;
  email?: string;
  telefone?: string;
}

// ============= DADOS DO IMÓVEL =============

export interface PropertyData {
  id: number;
  rua: string | null;
  bairro: string;
  municipio: string;
  estado: string;
  area: number;
  quartos: number;
  banheiros?: number;
  suites?: number;
  vagas: number | null;
  valor_atual: number;
  tipo: string;
  foto_capa?: string | null;
  descricao?: string | null;
  // Dados extras do formulário
  cep?: string;
  condominio?: number;
  iptu?: number;
  aVenda?: boolean;
  linkVenda?: string;
  mobiliado?: string;
  situacaoLegal?: string[];
  locaisProximos?: string;
  // Avaliações (1-5)
  avaliacaoTecnica?: number;
  localizacao?: number;
  planta?: number;
  acabamentos?: number;
  conservacao?: number;
  areasComuns?: number;
  // Features selecionadas
  features?: string[];
  // Especificações do tipo
  especificacoes?: {
    tipo?: string;
    checklist?: Record<string, boolean>;
    detalhes?: Record<string, string | number | null>;
  };
}

// ============= IMÓVEIS SIMILARES =============

export interface SimilarProperty {
  id: number;
  titulo: string;
  categoria?: string;
  descricao: string;
  valor: number;
  area: number;
  quartos: number;
  suites?: number;
  banheiros: number;
  vagas: number;
  imagem: string;
  imagens?: string[]; // Múltiplas imagens (até 4)
  status: 'ativo' | 'vendido';
  link?: string;
  // Dados de localização
  rua?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  estado?: string | null;
}

// ============= DADOS DO CORRETOR =============

export interface BrokerData {
  nome: string | null;
  email: string | null;
  creci: string | null;
  avatar_url: string | null;
  imobiliaria?: string | null;
  telefone?: string | null;
  logo_imobiliaria_url?: string | null;
  signature_url?: string | null;
  // Custom overrides for PDF
  telefone_custom?: string | null;
  email_custom?: string | null;
}

// ============= DADOS DE MERCADO =============

export interface MarketData {
  valor_estimado: number;
  confianca: number;
  amostras: number;
  minimo: number;
  medio: number;
  maximo: number;
  similares: SimilarProperty[];
}

// ============= CONFIGURAÇÕES DO PLANO DE MARKETING =============

export interface MarketingPlanSettings {
  introduction?: { enabled: boolean };
  pillars?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  funnel?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  benefits?: { enabled: boolean };
  rentalFunnel?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  indicators?: { enabled: boolean };
}

// ============= CONFIGURAÇÕES DO PDF =============

export interface PdfSettings {
  showMinimo?: boolean;
  showMaximo?: boolean;
  showMarketingPlan?: boolean;
  marketingPlan?: MarketingPlanSettings;
  // Client visibility settings
  showClient?: boolean;
  showClientEmail?: boolean;
  showClientPhone?: boolean;
  // Broker contact settings
  showBrokerContact?: boolean;
  // Custom colors
  pdfColors?: PdfColorScheme;
  // Rental-specific
  tempoLocacao?: string;
  showTempoLocacao?: boolean;
}

// ============= PROPS DO RELATÓRIO COMPLETO =============

export interface ReportProps {
  clientName: string;
  client?: ClientData;
  property: PropertyData;
  market: MarketData;
  broker?: BrokerData;
  settings?: PdfSettings;
}

// ============= TIPO DE RELATÓRIO =============

export type ReportType = 'sale' | 'rental' | 'buyer';

// ============= ORIENTAÇÃO =============

export type ReportOrientation = 'portrait' | 'landscape';
