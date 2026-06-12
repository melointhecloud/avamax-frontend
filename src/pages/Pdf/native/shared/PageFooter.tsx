/**
 * Footer Reutilizável para Páginas do PDF Nativo
 * 
 * Componente padrão para todas as páginas do relatório.
 * Exibe branding Avaluz e paginação.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { 
  SPACING, 
  FONT_SIZES,
  withOpacity,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../../lib/pdf/tokens';

export interface PageFooterProps {
  pageNumber: number;
  totalPages: number;
  colors?: PdfColorScheme;
  /** Custom label to show instead of "Estudo de Mercado" */
  label?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  pageNumber,
  totalPages,
  colors = DEFAULT_COLORS,
  label,
}) => {
  const c = colors;
  const styles = createStyles(c);

  // Parse label if provided (format: "Avaluz • Plano de Marketing")
  const labelParts = label ? label.split('•').map(s => s.trim()) : ['Avaluz', 'Estudo de Mercado'];

  return (
    <View style={styles.footer}>
      <View style={styles.branding}>
        <Text style={styles.brandText}>{labelParts[0]}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.brandText}>{labelParts[1] || 'Estudo de Mercado'}</Text>
      </View>
      
      <Text style={styles.pageNumber}>
        {String(pageNumber).padStart(2, '0')} / {totalPages}
      </Text>
    </View>
  );
};

const createStyles = (c: PdfColorScheme) => StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: withOpacity(c.secondary, 0.2),
    marginTop: 'auto',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  brandText: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
  },
  separator: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.textMuted, 0.5),
  },
  pageNumber: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
  },
});

export default PageFooter;
