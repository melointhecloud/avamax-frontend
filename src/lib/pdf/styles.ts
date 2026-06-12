/**
 * Estilos base compartilhados para @react-pdf/renderer
 * 
 * Diferente do Tailwind, @react-pdf/renderer usa StyleSheet.create()
 * Similar ao React Native. Definimos estilos reutilizáveis aqui.
 */

import { StyleSheet } from '@react-pdf/renderer';
import { 
  FONT_SIZES, 
  FONT_WEIGHTS, 
  LINE_HEIGHTS, 
  SPACING, 
  PADDING,
  BORDER_RADIUS,
  A4,
  DEFAULT_COLORS,
  PdfColorScheme,
  withOpacity,
} from './tokens';

// ============= ESTILOS DE PÁGINA =============

export const createPageStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => StyleSheet.create({
  page: {
    width: A4.width,
    height: A4.height,
    backgroundColor: colors.background,
    padding: PADDING.page,
    fontFamily: 'Helvetica', // Fonte padrão segura
    color: colors.text,
  },
  pageNoPadding: {
    width: A4.width,
    height: A4.height,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text,
  },
});

// ============= ESTILOS DE LAYOUT =============

export const layoutStyles = StyleSheet.create({
  // Flex containers
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  flex1: {
    flex: 1,
  },
  
  // Wrapping
  flexWrap: {
    flexWrap: 'wrap',
  },
  
  // Gaps (simulados com margin)
  gap1: {
    gap: SPACING[1],
  },
  gap2: {
    gap: SPACING[2],
  },
  gap3: {
    gap: SPACING[3],
  },
  gap4: {
    gap: SPACING[4],
  },
});

// ============= ESTILOS DE TIPOGRAFIA =============

export const createTypographyStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => StyleSheet.create({
  // Tamanhos
  textXs: {
    fontSize: FONT_SIZES.xs,
    lineHeight: LINE_HEIGHTS.normal,
  },
  textSm: {
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.normal,
  },
  textBase: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.normal,
  },
  textLg: {
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.normal,
  },
  textXl: {
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.tight,
  },
  text2xl: {
    fontSize: FONT_SIZES['2xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  text3xl: {
    fontSize: FONT_SIZES['3xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  text4xl: {
    fontSize: FONT_SIZES['4xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  
  // Pesos
  fontNormal: {
    fontWeight: FONT_WEIGHTS.normal,
  },
  fontMedium: {
    fontWeight: FONT_WEIGHTS.medium,
  },
  fontSemibold: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  fontBold: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  
  // Cores
  textWhite: {
    color: colors.text,
  },
  textMuted: {
    color: colors.textMuted,
  },
  textPrimary: {
    color: colors.primary,
  },
  textSecondary: {
    color: colors.secondary,
  },
  textAccent: {
    color: colors.accent,
  },
  
  // Transformações
  uppercase: {
    textTransform: 'uppercase',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  
  // Alinhamento
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
});

// ============= ESTILOS DE CARDS =============

export const createCardStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: PADDING.card,
  },
  cardSmall: {
    backgroundColor: colors.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: PADDING.cardSmall,
  },
  cardTransparent: {
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: PADDING.card,
  },
});

// ============= ESTILOS DE BADGES =============

export const createBadgeStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => StyleSheet.create({
  badgePrimary: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.3),
  },
  badgeSecondary: {
    backgroundColor: withOpacity(colors.secondary, 0.15),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
    borderWidth: 1,
    borderColor: withOpacity(colors.secondary, 0.3),
  },
  badgeAccent: {
    backgroundColor: withOpacity(colors.accent, 0.15),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
    borderWidth: 1,
    borderColor: withOpacity(colors.accent, 0.3),
  },
  badgeSolid: {
    backgroundColor: colors.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
  },
});

// ============= ESTILOS DE HEADER/FOOTER =============

export const createHeaderFooterStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: PADDING.page,
    paddingTop: PADDING.page,
    paddingBottom: SPACING[4],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.page,
    paddingBottom: PADDING.page,
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.secondary, 0.2),
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: colors.textMuted,
  },
  pageNumber: {
    fontSize: FONT_SIZES.xs,
    color: colors.textMuted,
  },
});

// ============= ESTILOS DE IMAGEM =============

export const imageStyles = StyleSheet.create({
  cover: {
    objectFit: 'cover',
  },
  contain: {
    objectFit: 'contain',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
  },
  logo: {
    width: 80,
    height: 'auto',
    objectFit: 'contain',
  },
  logoSmall: {
    width: 48,
    height: 'auto',
    objectFit: 'contain',
  },
});

// ============= FACTORY FUNCTION =============

/**
 * Cria todos os estilos com as cores especificadas
 */
export const createAllStyles = (colors: PdfColorScheme = DEFAULT_COLORS) => ({
  page: createPageStyles(colors),
  layout: layoutStyles,
  typography: createTypographyStyles(colors),
  card: createCardStyles(colors),
  badge: createBadgeStyles(colors),
  headerFooter: createHeaderFooterStyles(colors),
  image: imageStyles,
});
