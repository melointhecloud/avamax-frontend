/**
 * Design Tokens para PDF Nativo (@react-pdf/renderer)
 * 
 * Este arquivo centraliza todas as constantes de design usadas nos templates PDF.
 * Diferente do Tailwind CSS, @react-pdf/renderer usa StyleSheet próprio,
 * então definimos os tokens aqui para manter consistência.
 */

// ============= CORES PADRÃO (Avaluz Orange Theme) =============

export interface PdfColorScheme {
  // Backgrounds
  background: string;
  backgroundGradientFrom: string;
  backgroundGradientVia: string;
  backgroundGradientTo: string;
  
  // Primary (ações principais, destaques)
  primary: string;
  primaryLight: string;
  
  // Secondary (informações secundárias)
  secondary: string;
  secondaryLight: string;
  
  // Accent (sucesso, confirmações)
  accent: string;
  
  // Text
  text: string;
  textMuted: string;
  
  // Cards
  cardBackground: string;
  cardBorder: string;
}

export const DEFAULT_COLORS: PdfColorScheme = {
  background: '#0A1628',
  backgroundGradientFrom: '#061224',
  backgroundGradientVia: '#0A1E3C',
  backgroundGradientTo: '#0D2847',
  primary: '#f97316',      // orange-500
  primaryLight: '#fb923c', // orange-400
  secondary: '#3b82f6',    // blue-500
  secondaryLight: '#60a5fa', // blue-400
  accent: '#10b981',       // emerald-500
  text: '#ffffff',
  textMuted: '#94a3b8',    // slate-400
  cardBackground: 'rgba(59, 130, 246, 0.1)',
  cardBorder: 'rgba(96, 165, 250, 0.2)',
};

export const RENTAL_COLORS: PdfColorScheme = {
  ...DEFAULT_COLORS,
  primary: '#10b981',      // emerald-500
  primaryLight: '#34d399', // emerald-400
};

export const BUYER_COLORS: PdfColorScheme = {
  ...DEFAULT_COLORS,
  primary: '#f97316',      // orange-500
  primaryLight: '#fb923c', // orange-400
};

// ============= TIPOGRAFIA =============

export const FONT_SIZES = {
  xs: 8,
  sm: 10,
  base: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
} as const;

export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// ============= ESPAÇAMENTO =============

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const PADDING = {
  page: 30,         // Padding interno da página A4
  section: 20,      // Padding entre seções
  card: 16,         // Padding interno dos cards
  cardSmall: 12,    // Padding para cards menores
} as const;

// ============= DIMENSÕES A4 =============

export const A4 = {
  width: 595.28,    // pontos (210mm)
  height: 841.89,   // pontos (297mm)
  widthMm: 210,
  heightMm: 297,
} as const;

// ============= BORDAS =============

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// ============= SOMBRAS (simuladas com bordas no PDF) =============

// @react-pdf/renderer não suporta box-shadow nativo
// Usamos bordas e backgrounds para simular profundidade

// ============= HELPERS =============

/**
 * Converte cor hex para formato com opacidade
 */
export const withOpacity = (hex: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
};

/**
 * Formata valor monetário para BRL
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formata valor por m²
 */
export const formatPricePerM2 = (value: number, area: number): string => {
  if (area <= 0) return '-';
  return `${formatCurrency(value / area)}/m²`;
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Gera ID único para documento
 */
export const generateDocId = (propertyId: number): string => {
  return `AVL-${propertyId.toString().padStart(6, '0')}`;
};
