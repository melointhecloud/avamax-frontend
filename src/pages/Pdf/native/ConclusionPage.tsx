/**
 * Página de Conclusão - @react-pdf/renderer
 * 
 * Página final do relatório com parecer de valor e assinatura do corretor.
 */

import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { 
  A4, 
  SPACING, 
  PADDING, 
  BORDER_RADIUS,
  FONT_SIZES,
  withOpacity,
  formatCurrency,
  formatDate,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../lib/pdf/tokens';
import { PropertyData, BrokerData, MarketData, PdfSettings } from '../../../lib/pdf/types';
import { PageHeader } from './shared/PageHeader';
import { PageFooter } from './shared/PageFooter';

interface ConclusionPageProps {
  property: PropertyData;
  broker?: BrokerData;
  market: MarketData;
  settings?: PdfSettings;
  colors?: PdfColorScheme;
  pageNumber: number;
  totalPages: number;
}

export const ConclusionPage: React.FC<ConclusionPageProps> = ({
  property,
  broker,
  market,
  settings = {},
  colors = DEFAULT_COLORS,
  pageNumber,
  totalPages,
}) => {
  const c = colors;
  const styles = createStyles(c);

  const showMinimo = settings.showMinimo !== false;
  const showMaximo = settings.showMaximo !== false;

  // Calcular valores de estratégia
  const valorPremium = market.valor_estimado * 1.05; // +5%
  const valorRapido = market.valor_estimado * 0.95; // -5%

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <PageHeader 
        title="Parecer de Valor" 
        subtitle="Conclusão do Estudo de Mercado"
        broker={broker}
        colors={c}
      />

      {/* Main Value Card */}
      <View style={styles.mainValueCard}>
        <Text style={styles.mainValueLabel}>VALOR DE MERCADO RECOMENDADO</Text>
        <Text style={styles.mainValue}>{formatCurrency(market.valor_estimado)}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            📊 Confiança: {market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca)}%
          </Text>
        </View>
      </View>

      {/* Strategy Cards Row */}
      <View style={styles.strategyRow}>
        {/* Premium */}
        <View style={[styles.strategyCard, styles.premiumCard]}>
          <Text style={styles.strategyIcon}>⭐</Text>
          <Text style={styles.strategyTitle}>Valor Premium</Text>
          <Text style={styles.strategyValue}>{formatCurrency(valorPremium)}</Text>
          <Text style={styles.strategyDescription}>
            Para imóveis diferenciados com alta demanda no bairro
          </Text>
        </View>

        {/* Quick Sale */}
        <View style={[styles.strategyCard, styles.quickCard]}>
          <Text style={styles.strategyIcon}>⚡</Text>
          <Text style={styles.strategyTitle}>Valor de Mercado</Text>
          <Text style={styles.strategyValue}>{formatCurrency(valorRapido)}</Text>
          <Text style={styles.strategyDescription}>
            Para negociação ágil com margem competitiva
          </Text>
        </View>
      </View>

      {/* Min/Max Range */}
      {(showMinimo || showMaximo) && (
        <View style={styles.rangeCard}>
          <Text style={styles.rangeTitle}>Faixa de Valores do Mercado</Text>
          <View style={styles.rangeRow}>
            {showMinimo && (
              <View style={styles.rangeItem}>
                <Text style={styles.rangeLabel}>Mínimo</Text>
                <Text style={styles.rangeValue}>{formatCurrency(market.minimo)}</Text>
              </View>
            )}
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Médio</Text>
              <Text style={[styles.rangeValue, styles.rangeValueHighlight]}>
                {formatCurrency(market.medio)}
              </Text>
            </View>
            {showMaximo && (
              <View style={styles.rangeItem}>
                <Text style={styles.rangeLabel}>Máximo</Text>
                <Text style={styles.rangeValue}>{formatCurrency(market.maximo)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Conclusion Text */}
      <View style={styles.conclusionSection}>
        <Text style={styles.conclusionText}>
          Com base na análise de {market.amostras} imóveis comparáveis na região de{' '}
          {property.bairro}, {property.municipio}, concluímos que o valor de mercado 
          do imóvel avaliado está adequadamente posicionado dentro da faixa apresentada.
        </Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureCard}>
          {/* Agency Column */}
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureColumnTitle}>IMOBILIÁRIA</Text>
            {broker?.logo_imobiliaria_url ? (
              <Image src={broker.logo_imobiliaria_url} style={styles.signatureLogo} />
            ) : (
              <Text style={styles.signaturePlaceholder}>
                {broker?.imobiliaria || 'Imobiliária Parceira'}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.signatureDivider} />

          {/* Broker Column */}
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureColumnTitle}>CORRETOR RESPONSÁVEL</Text>
            
            {broker?.avatar_url && (
              <Image src={broker.avatar_url} style={styles.signatureAvatar} />
            )}
            
            <Text style={styles.signatureName}>{broker?.nome || 'Corretor Avaluz'}</Text>
            
            {broker?.creci && (
              <Text style={styles.signatureCreci}>CRECI: {broker.creci}</Text>
            )}

            {/* Signature */}
            <View style={styles.signatureArea}>
              {broker?.signature_url ? (
                <View style={styles.signatureWrapper}>
                  <Image src={broker.signature_url} style={styles.signatureImage} />
                </View>
              ) : (
                <View style={styles.signatureLine} />
              )}
              <Text style={styles.signatureLabel}>Assinatura do Corretor</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Legal Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Este estudo tem caráter informativo e não substitui laudo oficial de avaliação 
          emitido por profissional habilitado. Os valores apresentados refletem as condições 
          de mercado na data de emissão ({formatDate()}).
        </Text>
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

  // Main Value Card
  mainValueCard: {
    alignItems: 'center',
    backgroundColor: withOpacity(c.primary, 0.1),
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[6],
    marginBottom: SPACING[4],
    borderWidth: 2,
    borderColor: withOpacity(c.primary, 0.3),
  },
  mainValueLabel: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING[2],
  },
  mainValue: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 700,
    color: c.primary,
  },
  confidenceBadge: {
    backgroundColor: withOpacity(c.accent, 0.15),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
    marginTop: SPACING[3],
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    color: c.accent,
  },

  // Strategy Cards
  strategyRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  strategyCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
  },
  premiumCard: {
    backgroundColor: withOpacity(c.secondary, 0.1),
    borderColor: withOpacity(c.secondary, 0.3),
  },
  quickCard: {
    backgroundColor: withOpacity(c.accent, 0.1),
    borderColor: withOpacity(c.accent, 0.3),
  },
  strategyIcon: {
    fontSize: 20,
    marginBottom: SPACING[2],
  },
  strategyTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 600,
    color: c.text,
    marginBottom: SPACING[1],
  },
  strategyValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: c.text,
    marginBottom: SPACING[2],
  },
  strategyDescription: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    textAlign: 'center',
    lineHeight: 1.4,
  },

  // Range Card
  rangeCard: {
    backgroundColor: withOpacity(c.secondary, 0.08),
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.2),
  },
  rangeTitle: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rangeItem: {
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    marginBottom: SPACING[1],
  },
  rangeValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: 600,
    color: c.text,
  },
  rangeValueHighlight: {
    color: c.primary,
  },

  // Conclusion
  conclusionSection: {
    marginBottom: SPACING[4],
  },
  conclusionText: {
    fontSize: FONT_SIZES.sm,
    color: c.textMuted,
    lineHeight: 1.6,
  },

  // Signature Section
  signatureSection: {
    marginBottom: SPACING[4],
  },
  signatureCard: {
    flexDirection: 'row',
    backgroundColor: withOpacity(c.secondary, 0.1),
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.2),
  },
  signatureColumn: {
    flex: 1,
    alignItems: 'center',
  },
  signatureDivider: {
    width: 1,
    backgroundColor: withOpacity(c.secondary, 0.3),
    marginHorizontal: SPACING[4],
  },
  signatureColumnTitle: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING[3],
  },
  signatureLogo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  signaturePlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: c.text,
    fontWeight: 500,
  },
  signatureAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
    marginBottom: SPACING[2],
  },
  signatureName: {
    fontSize: FONT_SIZES.base,
    fontWeight: 600,
    color: c.text,
    marginBottom: SPACING[1],
  },
  signatureCreci: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    marginBottom: SPACING[3],
  },
  signatureArea: {
    alignItems: 'center',
    width: '100%',
  },
  signatureWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[2],
    marginBottom: SPACING[1],
  },
  signatureImage: {
    width: 100,
    height: 40,
    objectFit: 'contain',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: c.textMuted,
    marginBottom: SPACING[1],
  },
  signatureLabel: {
    fontSize: 7,
    color: c.textMuted,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: withOpacity(c.secondary, 0.05),
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    marginBottom: SPACING[4],
  },
  disclaimerText: {
    fontSize: 7,
    color: withOpacity(c.textMuted, 0.7),
    textAlign: 'center',
    lineHeight: 1.5,
  },
});

export default ConclusionPage;
