/**
 * Página de Introdução ao Plano de Marketing
 * PDF Nativo (@react-pdf/renderer)
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfColorScheme, FONT_SIZES, SPACING, PADDING, A4, withOpacity, BORDER_RADIUS } from '../../../../lib/pdf/tokens';
import { BrokerData, PropertyData } from '../../../../lib/pdf/types';
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
    paddingTop: SPACING[4],
  },
  // What is this plan card
  introCard: {
    padding: SPACING[5],
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING[4],
  },
  introTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  introText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.6,
    marginBottom: SPACING[2],
  },
  // Objective card
  objectiveCard: {
    padding: SPACING[5],
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING[4],
  },
  objectiveTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  objectiveText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.6,
    marginBottom: SPACING[3],
  },
  // Grid of 3 items
  objectiveGrid: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  objectiveItem: {
    flex: 1,
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  objectiveIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveItemTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING[1],
  },
  objectiveItemDesc: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  // Quote
  quoteCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: 'auto',
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Emoji icons
  emoji: {
    fontSize: 16,
  },
  emojiSmall: {
    fontSize: 20,
  },
  highlight: {
    fontWeight: 'bold',
  },
});

interface IntroPageProps {
  broker?: BrokerData;
  property: PropertyData;
  colors: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
}

export const IntroPage: React.FC<IntroPageProps> = ({
  broker,
  property,
  colors,
  pageNumber,
  totalPages,
}) => {
  return (
    <Page size="A4" style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title="Plano de Marketing Imobiliário"
        subtitle="Estratégia Personalizada"
        broker={broker}
        colors={colors}
        icon="✨"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* What is this plan */}
        <View style={[styles.introCard, { 
          backgroundColor: withOpacity(colors.primary, 0.15),
          borderWidth: 1,
          borderColor: withOpacity(colors.primary, 0.3),
        }]}>
          <View style={styles.introTitle}>
            <Text style={styles.emoji}>📄</Text>
            <Text style={{ color: colors.text }}>O que é este Plano de Marketing?</Text>
          </View>
          <Text style={[styles.introText, { color: withOpacity(colors.secondaryLight, 0.8) }]}>
            Este documento apresenta uma{' '}
            <Text style={[styles.highlight, { color: colors.primary }]}>estratégia estruturada e personalizada</Text>
            {' '}para a comercialização do seu imóvel, desenvolvida com base nas melhores práticas do mercado imobiliário nacional e internacional.
          </Text>
          <Text style={[styles.introText, { color: withOpacity(colors.secondaryLight, 0.7) }]}>
            Diferente de abordagens genéricas, este plano foi criado considerando as características específicas do seu imóvel, o perfil de compradores da região e as dinâmicas atuais do mercado em{' '}
            <Text style={{ color: colors.text, fontWeight: 'medium' }}>{property.bairro}, {property.municipio}</Text>.
          </Text>
        </View>

        {/* Objective */}
        <View style={[styles.objectiveCard, {
          backgroundColor: withOpacity(colors.secondary, 0.1),
          borderWidth: 1,
          borderColor: withOpacity(colors.secondaryLight, 0.2),
        }]}>
          <View style={styles.objectiveTitle}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={{ color: colors.text }}>Objetivo Estratégico</Text>
          </View>
          <Text style={[styles.objectiveText, { color: withOpacity(colors.secondaryLight, 0.8) }]}>
            O objetivo central deste plano é{' '}
            <Text style={[styles.highlight, { color: colors.primary }]}>maximizar o valor percebido do imóvel</Text>,{' '}
            <Text style={[styles.highlight, { color: colors.primary }]}>reduzir o tempo de venda</Text> e{' '}
            <Text style={[styles.highlight, { color: colors.primary }]}>gerar segurança</Text> em todo o processo de comercialização.
          </Text>

          {/* Grid */}
          <View style={styles.objectiveGrid}>
            {/* Positioning */}
            <View style={[styles.objectiveItem, { backgroundColor: withOpacity(colors.background, 0.5) }]}>
              <View style={[styles.objectiveIcon, { backgroundColor: withOpacity(colors.accent, 0.2) }]}>
                <Text style={styles.emojiSmall}>📈</Text>
              </View>
              <Text style={[styles.objectiveItemTitle, { color: colors.text }]}>Posicionamento Correto</Text>
              <Text style={[styles.objectiveItemDesc, { color: withOpacity(colors.secondaryLight, 0.6) }]}>
                Preço alinhado com o mercado atual
              </Text>
            </View>

            {/* Value Protection */}
            <View style={[styles.objectiveItem, { backgroundColor: withOpacity(colors.background, 0.5) }]}>
              <View style={[styles.objectiveIcon, { backgroundColor: withOpacity(colors.primary, 0.2) }]}>
                <Text style={styles.emojiSmall}>🛡️</Text>
              </View>
              <Text style={[styles.objectiveItemTitle, { color: colors.text }]}>Preservação de Valor</Text>
              <Text style={[styles.objectiveItemDesc, { color: withOpacity(colors.secondaryLight, 0.6) }]}>
                Evitar desvalorização por tempo
              </Text>
            </View>

            {/* Qualified Demand */}
            <View style={[styles.objectiveItem, { backgroundColor: withOpacity(colors.background, 0.5) }]}>
              <View style={[styles.objectiveIcon, { backgroundColor: withOpacity(colors.secondary, 0.2) }]}>
                <Text style={styles.emojiSmall}>👤</Text>
              </View>
              <Text style={[styles.objectiveItemTitle, { color: colors.text }]}>Demanda Qualificada</Text>
              <Text style={[styles.objectiveItemDesc, { color: withOpacity(colors.secondaryLight, 0.6) }]}>
                Atrair compradores com perfil ideal
              </Text>
            </View>
          </View>
        </View>

        {/* Quote */}
        <View style={[styles.quoteCard, {
          backgroundColor: withOpacity(colors.secondary, 0.1),
          borderWidth: 1,
          borderColor: withOpacity(colors.secondaryLight, 0.2),
        }]}>
          <Text style={[styles.quoteText, { color: withOpacity(colors.secondaryLight, 0.7) }]}>
            "Um imóvel bem posicionado e bem apresentado não vende por sorte — vende por estratégia."
          </Text>
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

export default IntroPage;
