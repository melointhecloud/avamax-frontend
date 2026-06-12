/**
 * Página de Benefícios para o Proprietário
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
    paddingTop: SPACING[4],
  },
  // Benefits grid
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  benefitCard: {
    width: '48%',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
  },
  benefitCardFull: {
    width: '100%',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  benefitDescription: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 1.5,
  },
  // Commitment card
  commitmentCard: {
    padding: SPACING[5],
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    gap: SPACING[4],
    flex: 1,
  },
  commitmentIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentContent: {
    flex: 1,
  },
  commitmentTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  commitmentText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.6,
    marginBottom: SPACING[2],
  },
  commitmentQuote: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  highlight: {
    fontWeight: 'bold',
  },
  // Emojis
  emoji: {
    fontSize: 18,
  },
  emojiLarge: {
    fontSize: 26,
  },
});

// Benefits data
const BENEFITS = [
  {
    title: 'Transparência Total',
    icon: '👁️',
    iconColor: '#22c55e', // green
    description: 'Relatórios periódicos com todas as ações realizadas, visualizações, contatos recebidos e feedbacks de visitas.',
  },
  {
    title: 'Segurança Jurídica',
    icon: '🛡️',
    iconColor: '#f97316', // orange
    description: 'Suporte na análise documental e acompanhamento em todas as etapas da transação até o fechamento.',
  },
  {
    title: 'Visibilidade Qualificada',
    icon: '👤',
    iconColor: '#3b82f6', // blue
    description: 'Seu imóvel exposto para compradores com real interesse e capacidade financeira para a aquisição.',
  },
  {
    title: 'Controle do Processo',
    icon: '📊',
    iconColor: '#a855f7', // purple
    description: 'Acompanhamento em tempo real do status da comercialização com métricas claras e objetivas.',
  },
  {
    title: 'Decisões Baseadas em Dados',
    icon: '💾',
    iconColor: '#14b8a6', // teal
    description: 'Todas as recomendações são fundamentadas em análises de mercado reais, comparativos de vendas e tendências da região. Nada de achismos.',
    fullWidth: true,
  },
];

interface BenefitsPageProps {
  broker?: BrokerData;
  colors: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
}

export const BenefitsPage: React.FC<BenefitsPageProps> = ({
  broker,
  colors,
  pageNumber,
  totalPages,
}) => {
  return (
    <Page size="A4" style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title="Benefícios para o Proprietário"
        subtitle="Vantagens Exclusivas"
        broker={broker}
        colors={colors}
        icon="⭐"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Benefits Grid */}
        <View style={styles.benefitsGrid}>
          {BENEFITS.map((benefit, idx) => (
            <View
              key={idx}
              style={[
                benefit.fullWidth ? styles.benefitCardFull : styles.benefitCard,
                {
                  backgroundColor: withOpacity(colors.secondary, 0.1),
                  borderWidth: 1,
                  borderColor: withOpacity(colors.secondaryLight, 0.2),
                },
              ]}
            >
              <View style={styles.benefitHeader}>
                <View style={[styles.benefitIcon, { backgroundColor: withOpacity(benefit.iconColor, 0.2) }]}>
                  <Text style={styles.emoji}>{benefit.icon}</Text>
                </View>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>{benefit.title}</Text>
              </View>
              <Text style={[styles.benefitDescription, { color: withOpacity(colors.secondaryLight, 0.6) }]}>
                {benefit.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Commitment Card */}
        <View style={[styles.commitmentCard, {
          backgroundColor: withOpacity(colors.primary, 0.15),
          borderWidth: 2,
          borderColor: withOpacity(colors.primary, 0.4),
        }]}>
          {/* Icon */}
          <View style={[styles.commitmentIcon, { backgroundColor: withOpacity(colors.primary, 0.3) }]}>
            <Text style={styles.emojiLarge}>✨</Text>
          </View>

          {/* Content */}
          <View style={styles.commitmentContent}>
            <Text style={[styles.commitmentTitle, { color: colors.text }]}>
              Compromisso com Resultados
            </Text>
            <Text style={[styles.commitmentText, { color: withOpacity(colors.secondaryLight, 0.8) }]}>
              Este plano não é apenas uma lista de tarefas — é uma{' '}
              <Text style={[styles.highlight, { color: colors.primary }]}>estratégia completa de proteção do seu patrimônio</Text>
              . Nosso objetivo vai além da venda: buscamos garantir que você obtenha o{' '}
              <Text style={[styles.highlight, { color: colors.primary }]}>melhor valor possível</Text>, no{' '}
              <Text style={[styles.highlight, { color: colors.primary }]}>menor tempo</Text>, e com total{' '}
              <Text style={[styles.highlight, { color: colors.primary }]}>segurança</Text>.
            </Text>
            <Text style={[styles.commitmentText, { color: withOpacity(colors.secondaryLight, 0.7) }]}>
              Com método, inteligência de dados e acompanhamento profissional, transformamos o processo de venda em uma experiência controlada e previsível — onde cada etapa tem propósito e cada decisão é fundamentada.
            </Text>
            <Text style={[styles.commitmentQuote, { color: colors.primary }]}>
              "Porque seu imóvel merece mais do que ser anunciado — merece ser estrategicamente posicionado para vender."
            </Text>
          </View>
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

export default BenefitsPage;
