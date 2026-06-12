import { StyleSheet, Font } from '@react-pdf/renderer';

// NOTE: Using Helvetica (built-in font) instead of Inter
// Attempted to download Inter fonts from multiple sources but all failed
// (GitHub, Google Fonts) - likely due to network/firewall restrictions
// Helvetica is a professional, built-in font that works reliably

// Interface para cores customizáveis
export interface PdfColors {
    primary: string;
    secondary: string;
    secondaryLight: string;
    text: string;
    textMuted: string;
    cardBackground: string;
    cardBorder: string;
}

// Cores padrão
export const defaultColors: PdfColors = {
    primary: '#1E40AF', // blue-700
    secondary: '#FF6B35', // orange-500
    secondaryLight: '#FFA366',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    cardBackground: 'rgba(59, 130, 246, 0.1)', // blue-500/10
    cardBorder: 'rgba(96, 165, 250, 0.2)', // blue-400/20
};

// Função para criar estilos com cores customizadas
export const createPdfStyles = (colors: PdfColors = defaultColors) =>
    StyleSheet.create({
        // Page Layouts
        page: {
            backgroundColor: '#0A1E3C',
            fontFamily: 'Helvetica', // Built-in font - reliable and professional
            fontSize: 10,
            color: colors.text,
            position: 'relative',
        },

        // Typography
        h1: {
            fontSize: 32,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 8,
        },
        h2: {
            fontSize: 24,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 6,
        },
        h3: {
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 4,
        },
        h4: {
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 3,
        },
        body: {
            fontSize: 10,
            fontWeight: 400,
            color: colors.textMuted,
            lineHeight: 1.5,
        },
        bodySmall: {
            fontSize: 8,
            fontWeight: 400,
            color: colors.textMuted,
            lineHeight: 1.4,
        },
        label: {
            fontSize: 8,
            fontWeight: 500,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
        },

        // Layout Components
        header: {
            padding: 32,
            borderBottom: `1px solid rgba(96, 165, 250, 0.1)`,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        footer: {
            padding: 32,
            borderTop: `1px solid rgba(96, 165, 250, 0.1)`,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        footerText: {
            fontSize: 8,
            color: 'rgba(96, 165, 250, 0.4)',
        },
        content: {
            padding: 32,
            flex: 1,
        },

        // Cards
        card: {
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: 16,
        },
        cardAccent: {
            backgroundColor: `${colors.secondary}33`, // 20% opacity
            border: `2px solid ${colors.secondary}66`, // 40% opacity
            borderRadius: 12,
            padding: 20,
        },

        // Badges
        badge: {
            backgroundColor: `${colors.secondary}33`,
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 8,
            fontSize: 8,
            fontWeight: 600,
            color: colors.secondary,
        },

        // Utility
        flexRow: {
            flexDirection: 'row',
        },
        flexColumn: {
            flexDirection: 'column',
        },
        spaceBetween: {
            justifyContent: 'space-between',
        },
        alignCenter: {
            alignItems: 'center',
        },
        gap4: {
            gap: 4,
        },
        gap8: {
            gap: 8,
        },
        gap12: {
            gap: 12,
        },
        gap16: {
            gap: 16,
        },
        gap24: {
            gap: 24,
        },

        // Margins and Paddings
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb12: { marginBottom: 12 },
        mb16: { marginBottom: 16 },
        mb24: { marginBottom: 24 },
        mt4: { marginTop: 4 },
        mt8: { marginTop: 8 },
        mt12: { marginTop: 12 },
        mt16: { marginTop: 16 },
        mt24: { marginTop: 24 },

        // Colors
        textPrimary: { color: colors.primary },
        textSecondary: { color: colors.secondary },
        textMuted: { color: colors.textMuted },
        textWhite: { color: colors.text },

        // Images
        coverImage: {
            width: '100%',
            height: 300,
            objectFit: 'cover',
            borderRadius: 12,
        },
        logo: {
            width: 60,
            height: 60,
            borderRadius: 8,
        },
        avatarSmall: {
            width: 40,
            height: 40,
            borderRadius: 8,
        },
    });

// Exportar tipo de estilos
export type PdfStyleSheet = ReturnType<typeof createPdfStyles>;
