/**
 * Capa do Relatório - @react-pdf/renderer
 * 
 * Primeira página do PDF com:
 * - Logo Avaluz
 * - Título do estudo
 * - Foto do imóvel
 * - Dados principais do imóvel
 * - Dados de localização
 * - Card do corretor
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
  formatDate,
  generateDocId,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../lib/pdf/tokens';
import { PropertyData, BrokerData, ClientData, MarketData, PdfSettings } from '../../../lib/pdf/types';

// Logo Avaluz em base64 ou URL pública
// Para @react-pdf/renderer, precisamos de URLs absolutas ou base64
const AVALUZ_LOGO = '/images/avaluz-logo.png';

interface CoverPageProps {
  property: PropertyData;
  broker?: BrokerData;
  client?: ClientData;
  clientName?: string;
  market: MarketData;
  settings?: PdfSettings;
  colors?: PdfColorScheme;
  pageNumber?: number;
  totalPages?: number;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  property,
  broker,
  client,
  clientName = 'Cliente Avaluz',
  market,
  settings = {},
  colors = DEFAULT_COLORS,
  pageNumber = 1,
  totalPages = 1,
}) => {
  const c = colors;
  const styles = createStyles(c);

  const showClient = settings.showClient !== false;
  const showBrokerContact = settings.showBrokerContact !== false;
  const brokerPhone = broker?.telefone_custom || broker?.telefone;
  const brokerEmail = broker?.email_custom || broker?.email;
  const displayClientName = client?.nome || clientName;

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image src={AVALUZ_LOGO} style={styles.logo} />
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>
            {formatDate()}
          </Text>
          <Text style={styles.idText}>
            ID: {generateDocId(property.id)}
          </Text>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>★ Estudo de Mercado Profissional</Text>
        </View>
        <Text style={styles.title}>
          Avaliação Estratégica
        </Text>
        <Text style={[styles.title, styles.titlePrimary]}>
          de Valor de Mercado
        </Text>
        <Text style={styles.subtitle}>
          Método Comparativo Direto • Análise de {market.amostras} Imóveis
        </Text>
      </View>

      {/* Property Image */}
      <View style={styles.imageContainer}>
        {property.foto_capa ? (
          <Image
            src={property.foto_capa}
            style={styles.propertyImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
        {/* Property Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{property.tipo.toUpperCase()}</Text>
        </View>
      </View>

      {/* Property Specs Grid */}
      <View style={styles.specsGrid}>
        <View style={styles.specCard}>
          <Text style={styles.specValue}>{property.area}</Text>
          <Text style={styles.specLabel}>M² ÚTEIS</Text>
        </View>
        <View style={styles.specCard}>
          <Text style={styles.specValue}>{property.quartos}</Text>
          <Text style={styles.specLabel}>QUARTOS</Text>
        </View>
        <View style={styles.specCard}>
          <Text style={styles.specValue}>{property.suites || 0}</Text>
          <Text style={styles.specLabel}>SUÍTES</Text>
        </View>
        <View style={styles.specCard}>
          <Text style={styles.specValue}>{property.banheiros || 0}</Text>
          <Text style={styles.specLabel}>BANHEIROS</Text>
        </View>
        <View style={styles.specCard}>
          <Text style={styles.specValue}>{property.vagas || 0}</Text>
          <Text style={styles.specLabel}>VAGAS</Text>
        </View>
      </View>

      {/* Info Cards Row */}
      <View style={styles.infoRow}>
        {/* Property Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>IMÓVEL</Text>
          <Text style={styles.infoValue}>{property.tipo}</Text>
          <Text style={styles.infoSubtext}>{property.area}m² · {property.quartos} quartos</Text>
        </View>

        {/* Location Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>LOCALIZAÇÃO</Text>
          <Text style={styles.infoValue}>{property.bairro}</Text>
          <Text style={styles.infoSubtext}>{property.municipio}, {property.estado}</Text>
        </View>

        {/* Client Card */}
        {showClient && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>PREPARADO PARA</Text>
            <Text style={styles.infoValue}>{displayClientName}</Text>
          </View>
        )}
      </View>

      {/* Broker Card */}
      <View style={styles.brokerCard}>
        <View style={styles.brokerLeft}>
          {broker?.avatar_url && (
            <Image src={broker.avatar_url} style={styles.brokerAvatar} />
          )}
          <View>
            <Text style={styles.brokerName}>{broker?.nome || 'Corretor Avaluz'}</Text>
            {broker?.creci && (
              <Text style={styles.brokerCreci}>CRECI: {broker.creci}</Text>
            )}
          </View>
        </View>

        {showBrokerContact && (
          <View style={styles.brokerRight}>
            {brokerPhone && (
              <Text style={styles.brokerContact}>📱 {brokerPhone}</Text>
            )}
            {brokerEmail && (
              <Text style={styles.brokerContact}>✉️ {brokerEmail}</Text>
            )}
          </View>
        )}

        {broker?.logo_imobiliaria_url && (
          <Image src={broker.logo_imobiliaria_url} style={styles.agencyLogo} />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>avaluz.com.br</Text>
        <Text style={styles.footerText}>{pageNumber} / {totalPages}</Text>
      </View>
    </Page>
  );
};

// ============= ESTILOS =============

const createStyles = (c: PdfColorScheme) => StyleSheet.create({
  page: {
    width: A4.width,
    height: A4.height,
    backgroundColor: c.background,
    padding: PADDING.page,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.secondaryLight, 0.7),
  },
  idText: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.secondaryLight, 0.5),
    marginTop: 2,
  },

  // Title
  titleSection: {
    marginBottom: SPACING[4],
  },
  badge: {
    backgroundColor: withOpacity(c.primary, 0.1),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
    alignSelf: 'flex-start',
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: withOpacity(c.primary, 0.3),
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.primaryLight, 0.8),
    fontWeight: 500,
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 700,
    color: c.text,
    lineHeight: 1.2,
  },
  titlePrimary: {
    color: c.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: withOpacity(c.secondaryLight, 0.6),
    marginTop: SPACING[2],
  },

  // Image
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING[4],
    backgroundColor: withOpacity(c.secondary, 0.1),
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: withOpacity(c.secondary, 0.5),
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: withOpacity(c.primary, 0.9),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[3],
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: c.text,
    fontWeight: 500,
  },

  // Specs Grid
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
    gap: SPACING[2],
  },
  specCard: {
    flex: 1,
    backgroundColor: withOpacity(c.secondary, 0.1),
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.2),
  },
  specValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: c.text,
  },
  specLabel: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.secondaryLight, 0.6),
    marginTop: SPACING[1],
    textTransform: 'uppercase',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  infoCard: {
    flex: 1,
    backgroundColor: withOpacity(c.secondary, 0.1),
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.2),
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: withOpacity(c.secondaryLight, 0.6),
    textTransform: 'uppercase',
    marginBottom: SPACING[2],
  },
  infoValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: c.text,
    marginBottom: SPACING[1],
  },
  infoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: c.textMuted,
  },

  // Broker Card
  brokerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: withOpacity(c.secondary, 0.15),
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: withOpacity(c.secondaryLight, 0.3),
    marginBottom: SPACING[4],
  },
  brokerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  brokerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
  },
  brokerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: 600,
    color: c.text,
  },
  brokerCreci: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    marginTop: 2,
  },
  brokerRight: {
    alignItems: 'flex-end',
  },
  brokerContact: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
    marginTop: 2,
  },
  agencyLogo: {
    width: 60,
    height: 30,
    objectFit: 'contain',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: withOpacity(c.secondary, 0.2),
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: c.textMuted,
  },
});

export default CoverPage;
