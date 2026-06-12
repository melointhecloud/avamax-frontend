/**
 * Página do Funil de Vendas
 * PDF Nativo (@react-pdf/renderer)
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfColorScheme, FONT_SIZES, SPACING, PADDING, A4, withOpacity, BORDER_RADIUS } from '../../../../lib/pdf/tokens';
import { BrokerData } from '../../../../lib/pdf/types';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';

const styles = StyleSheet.create({
  page: {
    width: A4.width,
    height: A4.height,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: PADDING.page,
    paddingTop: SPACING[2],
  },
  intro: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.6,
    marginBottom: SPACING[3],
  },
  stepsContainer: {
    gap: SPACING[2],
  },
  // Step card
  stepCard: {
    flexDirection: 'row',
    paddingLeft: SPACING[4],
    position: 'relative',
  },
  stepBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  stepContent: {
    flex: 1,
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    gap: SPACING[3],
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  stepRow: {
    flexDirection: 'row',
    gap: SPACING[1],
    marginBottom: SPACING[1],
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    minWidth: 45,
  },
  stepValue: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  stepImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING[2],
    padding: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  stepImpactText: {
    fontSize: 10,
    fontWeight: 'medium',
  },
});

// Funnel steps data
const FUNNEL_STEPS = [
  {
    number: 1,
    title: 'Estrutura e Segurança',
    color: '#3b82f6', // blue
    what: 'Organização documental completa e análise jurídica do imóvel.',
    why: 'Um processo de venda seguro começa com documentação em ordem.',
    impact: 'Evita problemas e transmite confiança ao comprador.',
  },
  {
    number: 2,
    title: 'Preparação e Apresentação',
    color: '#14b8a6', // teal
    what: 'Home staging, reparos, produção de fotos e vídeos profissionais.',
    why: 'A primeira impressão visual define 90% da decisão do comprador.',
    impact: 'Destaque em portais e redes sociais.',
  },
  {
    number: 3,
    title: 'Divulgação Estratégica',
    color: '#f97316', // orange
    what: 'Publicação em portais, redes sociais, anúncios pagos e parcerias.',
    why: 'Alcançar o maior número de compradores qualificados possível.',
    impact: 'Gera fluxo constante de interessados.',
  },
  {
    number: 4,
    title: 'Conversão',
    color: '#f43f5e', // rose
    what: 'Agendamento de visitas, negociação e fechamento do negócio.',
    why: 'Transformar interessados em compradores reais.',
    impact: 'Acelerar o fechamento com técnicas de negociação.',
  },
  {
    number: 5,
    title: 'Acompanhamento e Feedback',
    color: '#10b981', // emerald
    what: 'Relatórios periódicos, análise de visitas e ajustes na estratégia.',
    why: 'Manter o proprietário informado e otimizar o processo.',
    impact: 'Transparência total e tomada de decisão baseada em dados.',
  },
];

interface FunnelPageProps {
  broker?: BrokerData;
  colors: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
}

export const FunnelPage: React.FC<FunnelPageProps> = ({
  broker,
  colors,
  pageNumber,
  totalPages,
}) => {
  return (
    <Page size="A4" style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title="Ações de Marketing"
        subtitle="Funil de Vendas"
        broker={broker}
        colors={colors}
        icon="🔽"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.intro, { color: withOpacity(colors.secondaryLight, 0.7) }]}>
          As ações de marketing seguem um{' '}
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>funil estruturado</Text>
          , onde cada etapa prepara o terreno para a próxima.
        </Text>

        <View style={styles.stepsContainer}>
          {FUNNEL_STEPS.map((step) => (
            <View key={step.number} style={styles.stepCard}>
              {/* Vertical bar */}
              <View style={[styles.stepBar, { backgroundColor: step.color }]} />

              {/* Card content */}
              <View style={[styles.stepContent, {
                backgroundColor: withOpacity(step.color, 0.1),
                borderWidth: 1,
                borderColor: withOpacity(step.color, 0.2),
              }]}>
                <View style={styles.stepHeader}>
                  {/* Number badge */}
                  <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>

                  {/* Step info */}
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>

                    <View style={styles.stepRow}>
                      <Text style={[styles.stepLabel, { color: step.color }]}>O que:</Text>
                      <Text style={[styles.stepValue, { color: withOpacity(colors.secondaryLight, 0.8) }]}>
                        {step.what}
                      </Text>
                    </View>

                    <View style={styles.stepRow}>
                      <Text style={[styles.stepLabel, { color: step.color }]}>Por que:</Text>
                      <Text style={[styles.stepValue, { color: withOpacity(colors.secondaryLight, 0.8) }]}>
                        {step.why}
                      </Text>
                    </View>

                    {/* Impact */}
                    <View style={[styles.stepImpact, {
                      backgroundColor: withOpacity(colors.accent, 0.1),
                      borderWidth: 1,
                      borderColor: withOpacity(colors.accent, 0.2),
                    }]}>
                      <Text style={{ fontSize: 10, color: colors.accent }}>✓</Text>
                      <Text style={[styles.stepImpactText, { color: colors.accent }]}>
                        Impacto: {step.impact}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <PageFooter
        pageNumber={pageNumber}
        totalPages={totalPages}
        colors={colors}
        label="Avaluz • Plano de Marketing"
      />
    </Page>
  );
};

export default FunnelPage;
