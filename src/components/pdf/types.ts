// Tipos compartilhados para componentes PDF

export interface PropertyData {
    // Básico
    tipo: string;
    rua?: string;
    bairro: string;
    municipio: string;
    estado: string;
    cep?: string;

    // Especificações
    area: number;
    quartos: number;
    suites: number;
    banheiros: number;
    vagas: number;

    // Financeiro
    valor_atual?: number;
    condominio?: number;
    iptu?: number;
    aVenda?: boolean;
    linkVenda?: string;

    // Características
    mobiliado?: string;
    situacaoLegal?: string;
    features?: string[];
    descricao?: string;
    locaisProximos?: string;

    // Avaliações do corretor
    avaliacaoTecnica?: number;
    localizacao?: number;
    planta?: number;
    acabamentos?: number;
    conservacao?: number;
    areasComuns?: number;

    // Mídia
    foto_capa?: string;
}

export interface MarketData {
    valor_estimado: number;
    minimo: number;
    maximo: number;
    medio?: number;
    confianca: string;
    amostras: number;
}

export interface SampleData {
    id: string;
    titulo: string;
    descricao?: string;
    categoria?: string;
    status?: 'vendido' | 'ativo';

    // Localização
    rua?: string;
    bairro?: string;
    municipio?: string;
    estado?: string;

    // Especificações
    area: number;
    quartos: number;
    suites?: number;
    banheiros: number;
    vagas: number;

    // Valor
    valor: number;

    // Mídia
    imagem?: string;
    imagens?: string[];
    link?: string;
}

export interface BrokerData {
    nome?: string;
    telefone?: string;
    email?: string;
    creci?: string;
    avatar_url?: string;
    imobiliaria?: string;
    logo_imobiliaria_url?: string;
    telefone_imobiliaria?: string;
}

export interface ClientData {
    nome?: string;
    telefone?: string;
    email?: string;
}

export interface PdfSettings {
    showMinimo?: boolean;
    showMaximo?: boolean;
    showMarketingIntro?: boolean;
    showPillars?: boolean;
    showFunnel?: boolean;
    showBenefits?: boolean;
    showClientContact?: boolean;
    showBrokerContact?: boolean;
    pdfColors?: {
        primary?: string;
        secondary?: string;
        secondaryLight?: string;
        text?: string;
        textMuted?: string;
        cardBackground?: string;
        cardBorder?: string;
    };
}

export interface AvaluzPdfProps {
    clientName?: string;
    client?: ClientData;
    property: PropertyData;
    market: MarketData;
    broker?: BrokerData;
    samples: SampleData[];
    settings?: PdfSettings;
}
