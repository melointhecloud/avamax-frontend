/**
 * Página de Metodologia - @react-pdf/renderer
 * 
 * Explica os 5 passos da metodologia de avaliação Avaluz.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { 
  A4, 
  SPACING, 
  PADDING, 
  BORDER_RADIUS,
  FONT_SIZES,
  withOpacity,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../lib/pdf/tokens';
import { BrokerData } from '../../../lib/pdf/types';
import { PageHeader } from './shared/PageHeader';
import { PageFooter } from './shared/PageFooter';

interface MethodologyPageProps {
  broker?: BrokerData;
  colors?: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
}

const METHODOLOGY_STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Coleta de Dados',
    description: 'Análise das características físicas, localização e estado de conservação do imóvel avaliado, incluindo metragem, tipologia e diferenciais.',
  },
  {
    number: '02',
    icon: '🏠',
    title: 'Pesquisa de Mercado',
    description: 'Identificação de imóveis semelhantes ativos no mercado e transações recentes na mesma região, formando uma base comparativa sólida.',
  },
  {
    number: '03',
    icon: '📊',
    title: 'Homogeneização',
    description: 'Aplicação de fatores de ajuste científicos para equalizar diferenças entre o imóvel avaliado e os comparativos (área, padrão, idade).',
  },
  {
    number: '04',
    icon: '📈',
    title: 'Análise Estatística',
    description: 'Cálculo de médias, medianas e desvio padrão para determinar o intervalo de confiança e eliminar outliers do conjunto amostral.',
  },
  {
    number: '05',
    icon: '✅',
    title: 'Parecer de Valor',
    description: 'Consolidação dos resultados em um valor de mercado fundamentado, com margem de negociação e recomendações estratégicas.',
  },
];

export const MethodologyPage: React.FC<MethodologyPageProps> = ({
  broker,
  colors = DEFAULT_COLORS,
  pageNumber,
  totalPages,
}) => {
  const c = colors;
  const styles = createStyles(c);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <PageHeader 
        title="Metodologia da Avaliação" 
        subtitle="Como determinamos o valor do seu imóvel"
        broker={broker}
        colors={c}
      />

      {/* Intro Text */}
      <View style={styles.introSection}>
        <Text style={styles.introText}>
          Nossa metodologia segue as diretrizes da ABNT NBR 14653 e combina 
          análise comparativa de mercado com inteligência artificial para 
          garantir precisão e confiabilidade nos resultados.
        </Text>
      </View>

      {/* Steps Grid */}
      <View style={styles.stepsContainer}>
        {METHODOLOGY_STEPS.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            {/* Step Number Badge */}
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{step.number}</Text>
            </View>
            
            {/* Content */}
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>

            {/* Connector Line (except last) */}
            {index < METHODOLOGY_STEPS.length - 1 && (
              <View style={styles.connector} />
            )}
          </View>
        ))}
      </View>

      {/* Technical Note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteIcon}>📋</Text>
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>Nota Técnica</Text>
          <Text style={styles.noteText}>
            Este estudo utiliza o Método Comparativo Direto de Dados de Mercado, 
            reconhecido como o mais preciso para avaliação de imóveis residenciais 
            e comerciais urbanos.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <PageFooter 
        pageNumber={pageNumber} 
        totalPages={totalPages} 
        colors={c} 
      />
    </Page>
  );
};

const createStyles = (c: PdfColorScheme) => StyleSheet.create({
  page: {
    width: A4.width,
    height: A4.height,
    backgroundColor: c.background,
    padding: PADDING.page,
    fontFamily: 'Helvetica',
  },
  
  // Intro
  introSection: {
    marginBottom: SPACING[6],
  },
  introText: {
    fontSize: FONT_SIZES.sm,
    color: c.textMuted,
    lineHeight: 1.6,
  },

  // Steps
  stepsContainer: {
    flex: 1,
    gap: SPACING[3],
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[4],
    position: 'relative',
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: withOpacity(c.primary, 0.15),
    borderWidth: 2,
    borderColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 700,
    color: c.primary,
  },
  stepContent: {
    flex: 1,
    backgroundColor: withOpacity(c.secondary, 0.08),
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.15),
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  stepIcon: {
    fontSize: 16,
  },
  stepTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 600,
    color: c.text,
  },
  stepDescription: {
    fontSize: FONT_SIZES.sm,
    color: c.textMuted,
    lineHeight: 1.5,
  },
  connector: {
    position: 'absolute',
    left: 17, // Center of badge
    top: 40,
    width: 2,
    height: 20,
    backgroundColor: withOpacity(c.primary, 0.3),
  },

  // Note Card
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
    backgroundColor: withOpacity(c.accent, 0.1),
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: withOpacity(c.accent, 0.3),
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
  },
  noteIcon: {
    fontSize: 20,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 600,
    color: c.accent,
    marginBottom: SPACING[1],
  },
  noteText: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    lineHeight: 1.5,
  },
});

export default MethodologyPage;
