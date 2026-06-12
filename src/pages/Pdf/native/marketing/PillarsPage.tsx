/**
 * Página de Pilares Estratégicos
 * PDF Nativo (@react-pdf/renderer)
 * 
 * Renderiza 3 pilares por página. Use pillarSet='first' (1-3) ou 'second' (4-6)
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
    gap: SPACING[3],
  },
  // Pillar card
  pillarCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    gap: SPACING[3],
  },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarContent: {
    flex: 1,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  pillarBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    fontSize: 8,
    fontWeight: 'bold',
  },
  pillarTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  pillarDescription: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.6,
    marginBottom: SPACING[2],
  },
  pillarChecklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  pillarCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillarCheckText: {
    fontSize: 10,
  },
  pillarImpact: {
    marginTop: SPACING[2],
    padding: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  pillarImpactText: {
    fontSize: 9,
    fontWeight: 'medium',
  },
  // Emojis
  emoji: {
    fontSize: 22,
  },
  checkEmoji: {
    fontSize: 10,
  },
});

// Data for all 6 pillars
const PILLARS = [
  {
    number: '01',
    title: 'Precificação Inteligente',
    icon: '⚖️',
    iconColor: '#22c55e', // green
    description: 'A precificação correta é o fundamento de qualquer venda bem-sucedida. Utilizamos análise de dados de mercado para posicionar o imóvel de forma competitiva.',
    checks: ['Análise de comparativos', 'Faixas de preço estratégicas'],
  },
  {
    number: '02',
    title: 'Conteúdo e Apresentação',
    icon: '🎨',
    iconColor: '#a855f7', // purple
    description: 'A primeira impressão é decisiva. Investimos em produção visual de alto padrão e narrativa que destaca os diferenciais do imóvel.',
    checks: ['Fotos e vídeos profissionais', 'Tour virtual 360°'],
  },
  {
    number: '03',
    title: 'Experiência do Cliente',
    icon: '👥',
    iconColor: '#3b82f6', // blue
    description: 'Cada interação com o comprador é uma oportunidade de encantar. Criamos experiências memoráveis em todas as etapas do processo.',
    checks: ['Visitas personalizadas', 'Atendimento consultivo'],
  },
  {
    number: '04',
    title: 'Publicidade Digital Segmentada',
    icon: '🎯',
    iconColor: '#f97316', // orange
    description: 'Campanhas estratégicas para alcançar compradores qualificados nos canais mais efetivos para o perfil do imóvel.',
    checks: ['Google Ads e Meta Ads', 'Retargeting inteligente'],
    impact: 'Alcançar compradores certos, no momento certo, com a mensagem certa.',
  },
  {
    number: '05',
    title: 'Redes Sociais e Engajamento',
    icon: '👁️',
    iconColor: '#ec4899', // pink
    description: 'Presença estratégica nas principais redes sociais para ampliar a visibilidade e gerar interesse orgânico.',
    checks: ['Instagram e Facebook', 'Stories e Reels'],
    impact: 'Visibilidade massiva e engajamento com potenciais compradores.',
  },
  {
    number: '06',
    title: 'Parcerias Estratégicas',
    icon: '🤝',
    iconColor: '#14b8a6', // teal
    description: 'Rede de parceiros e corretores para ampliar o alcance e acelerar a comercialização do imóvel.',
    checks: ['Rede de corretores parceiros', 'Parcerias com imobiliárias'],
    impact: 'Multiplicar a exposição e acelerar o processo de venda com rede de parceiros.',
  },
];

interface PillarsPageProps {
  broker?: BrokerData;
  colors: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
  pillarSet: 'first' | 'second'; // 'first' = 1-3, 'second' = 4-6
}

export const PillarsPage: React.FC<PillarsPageProps> = ({
  broker,
  colors,
  pageNumber,
  totalPages,
  pillarSet,
}) => {
  const pillarsToShow = pillarSet === 'first' ? PILLARS.slice(0, 3) : PILLARS.slice(3, 6);

  return (
    <Page size="A4" style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title="Pilares Estratégicos"
        subtitle="Fundamentos"
        broker={broker}
        colors={colors}
        icon="📚"
      />

      {/* Content */}
      <View style={styles.content}>
        {pillarsToShow.map((pillar) => (
          <View
            key={pillar.number}
            style={[styles.pillarCard, {
              backgroundColor: withOpacity(colors.secondary, 0.1),
              borderWidth: 1,
              borderColor: withOpacity(colors.secondaryLight, 0.2),
            }]}
          >
            {/* Icon */}
            <View style={[styles.pillarIcon, { backgroundColor: withOpacity(pillar.iconColor, 0.2) }]}>
              <Text style={styles.emoji}>{pillar.icon}</Text>
            </View>

            {/* Content */}
            <View style={styles.pillarContent}>
              <View style={styles.pillarHeader}>
                <View style={[styles.pillarBadge, { 
                  backgroundColor: withOpacity(pillar.iconColor, 0.2),
                }]}>
                  <Text style={{ color: pillar.iconColor }}>{pillar.number}</Text>
                </View>
                <Text style={[styles.pillarTitle, { color: colors.text }]}>{pillar.title}</Text>
              </View>

              <Text style={[styles.pillarDescription, { color: withOpacity(colors.secondaryLight, 0.7) }]}>
                {pillar.description}
              </Text>

              {/* Checklist */}
              <View style={styles.pillarChecklist}>
                {pillar.checks.map((check, idx) => (
                  <View key={idx} style={styles.pillarCheckItem}>
                    <Text style={[styles.checkEmoji, { color: pillar.iconColor }]}>✓</Text>
                    <Text style={[styles.pillarCheckText, { color: withOpacity(colors.secondaryLight, 0.6) }]}>
                      {check}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Impact (only for set 2) */}
              {pillar.impact && (
                <View style={[styles.pillarImpact, {
                  backgroundColor: withOpacity(pillar.iconColor, 0.1),
                  borderWidth: 1,
                  borderColor: withOpacity(pillar.iconColor, 0.2),
                }]}>
                  <Text style={[styles.pillarImpactText, { color: pillar.iconColor }]}>
                    IMPACTO: {pillar.impact}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
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

export default PillarsPage;
