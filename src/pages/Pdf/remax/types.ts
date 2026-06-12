export interface RemaxColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export const REMAX_COLORS: RemaxColors = {
  primary: '#CC0000',
  secondary: '#003DA5',
  background: '#FFFFFF',
  text: '#1a1a1a',
};

export interface RemaxReportProps {
  clientName: string;
  client?: {
    nome: string;
    email?: string;
    telefone?: string;
  };
  property: {
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
    cep?: string;
    condominio?: number;
    iptu?: number;
    aVenda?: boolean;
    linkVenda?: string;
    mobiliado?: string;
    situacaoLegal?: string[];
    locaisProximos?: string;
    avaliacaoTecnica?: number;
    localizacao?: number;
    planta?: number;
    acabamentos?: number;
    conservacao?: number;
    areasComuns?: number;
    features?: string[];
    especificacoes?: {
      tipo?: string;
      checklist?: Record<string, boolean>;
      detalhes?: Record<string, string | number | null>;
    };
  };
  market: {
    valor_estimado: number;
    confianca: number;
    amostras: number;
    minimo: number;
    medio: number;
    maximo: number;
    similares: SimilarProperty[];
  };
  broker?: {
    nome: string | null;
    email: string | null;
    creci: string | null;
    avatar_url: string | null;
    imobiliaria?: string | null;
    telefone?: string | null;
    logo_imobiliaria_url?: string | null;
    signature_url?: string | null;
    telefone_custom?: string | null;
    email_custom?: string | null;
  };
  settings?: {
    showMinimo?: boolean;
    showMaximo?: boolean;
    showMarketingPlan?: boolean;
    showClient?: boolean;
    showClientEmail?: boolean;
    showClientPhone?: boolean;
    showBrokerContact?: boolean;
    pdfColors?: any;
    marketingPlan?: {
      introduction?: { enabled: boolean };
      pillars?: { enabled: boolean; items?: Record<string, boolean> };
      funnel?: { enabled: boolean; items?: Record<string, boolean> };
      benefits?: { enabled: boolean };
    };
  };
  variant?: 'quick' | 'full';
  darkMode?: boolean;
  isRental?: boolean;
}

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
  imagens?: string[];
  status: 'ativo' | 'vendido';
  link?: string;
  rua?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  estado?: string | null;
}
