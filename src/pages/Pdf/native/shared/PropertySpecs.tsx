/**
 * Grid de Especificações do Imóvel para PDF Nativo
 * 
 * Componente reutilizável para exibir área, quartos, banheiros, vagas, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { 
  SPACING, 
  FONT_SIZES, 
  BORDER_RADIUS,
  withOpacity,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../../lib/pdf/tokens';

interface SpecItem {
  value: string | number;
  label: string;
  icon?: string; // Emoji como fallback (PDF não suporta SVG do Lucide)
}

interface PropertySpecsProps {
  specs: SpecItem[];
  colors?: PdfColorScheme;
  variant?: 'default' | 'compact' | 'large';
  columns?: number;
}

export const PropertySpecs: React.FC<PropertySpecsProps> = ({
  specs,
  colors = DEFAULT_COLORS,
  variant = 'default',
  columns = 5,
}) => {
  const c = colors;
  const styles = createStyles(c, variant);

  // Calcular largura de cada item baseado em colunas
  const itemWidth = `${100 / columns}%`;

  return (
    <View style={styles.container}>
      {specs.map((spec, index) => (
        <View key={index} style={[styles.specCard, { width: itemWidth }]}>
          {spec.icon && <Text style={styles.icon}>{spec.icon}</Text>}
          <Text style={styles.value}>{spec.value}</Text>
          <Text style={styles.label}>{spec.label}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (c: PdfColorScheme, variant: 'default' | 'compact' | 'large') => {
  const isCompact = variant === 'compact';
  const isLarge = variant === 'large';

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING[2],
    },
    specCard: {
      backgroundColor: withOpacity(c.secondary, 0.1),
      borderRadius: BORDER_RADIUS.lg,
      padding: isCompact ? SPACING[2] : isLarge ? SPACING[5] : SPACING[3],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: withOpacity(c.secondaryLight, 0.2),
      flexShrink: 0,
    },
    icon: {
      fontSize: isLarge ? 20 : 14,
      marginBottom: SPACING[1],
    },
    value: {
      fontSize: isCompact ? FONT_SIZES.lg : isLarge ? FONT_SIZES['2xl'] : FONT_SIZES.xl,
      fontWeight: 700,
      color: c.text,
    },
    label: {
      fontSize: isCompact ? 6 : FONT_SIZES.xs,
      color: withOpacity(c.secondaryLight, 0.6),
      marginTop: SPACING[1],
      textTransform: 'uppercase',
      textAlign: 'center',
    },
  });
};

/**
 * Helper para criar specs a partir de PropertyData
 */
export const createPropertySpecs = (property: {
  area: number;
  quartos: number;
  suites?: number;
  banheiros?: number;
  vagas: number | null;
}): SpecItem[] => {
  return [
    { value: property.area, label: 'M² ÚTEIS', icon: '📐' },
    { value: property.quartos, label: 'QUARTOS', icon: '🛏️' },
    { value: property.suites || 0, label: 'SUÍTES', icon: '✨' },
    { value: property.banheiros || 0, label: 'BANHEIROS', icon: '🚿' },
    { value: property.vagas || 0, label: 'VAGAS', icon: '🚗' },
  ];
};

export default PropertySpecs;
