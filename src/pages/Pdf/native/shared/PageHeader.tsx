/**
 * Header Reutilizável para Páginas do PDF Nativo
 * 
 * Componente padrão para todas as páginas internas do relatório.
 * Exibe logo Avaluz, título da seção e dados do corretor/imobiliária.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import {
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  withOpacity,
  PdfColorScheme,
  DEFAULT_COLORS,
} from '../../../../lib/pdf/tokens';
import { BrokerData } from '../../../../lib/pdf/types';

const AVALUZ_LOGO = '/images/avaluz-logo.png';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  broker?: BrokerData;
  colors?: PdfColorScheme;
  showBrokerInfo?: boolean;
  /** Optional emoji icon to display before subtitle */
  icon?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  broker,
  colors = DEFAULT_COLORS,
  showBrokerInfo = true,
  icon,
}) => {
  const c = colors;
  const styles = createStyles(c);

  return (
    <View style={styles.header}>
      {/* Left: Icon/Logo + Title */}
      <View style={styles.leftSection}>
        {icon ? (
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        ) : (
          <Image src={AVALUZ_LOGO} style={styles.logo} />
        )}
        <View style={styles.titleContainer}>
          {subtitle && <Text style={styles.subtitleTop}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {/* Right: Broker Info + Logo */}
      <View style={styles.rightSection}>
        {showBrokerInfo && broker && (
          <>
            {broker.logo_imobiliaria_url && (
              <Image src={broker.logo_imobiliaria_url} style={styles.agencyLogo} />
            )}
            {broker.avatar_url && (
              <Image src={broker.avatar_url} style={styles.brokerAvatar} />
            )}
          </>
        )}
        <Image src={AVALUZ_LOGO} style={styles.logoSmall} />
      </View>
    </View>
  );
};

const createStyles = (c: PdfColorScheme) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(c.secondary, 0.2),
    marginBottom: SPACING[6],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: withOpacity(c.primary, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  logo: {
    width: 60,
    height: 30,
    objectFit: 'contain',
  },
  logoSmall: {
    width: 50,
    height: 25,
    objectFit: 'contain',
  },
  titleContainer: {
    gap: 2,
  },
  subtitleTop: {
    fontSize: FONT_SIZES.xs,
    color: c.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 700,
    color: c.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  agencyLogo: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
  },
  brokerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    objectFit: 'cover',
  },
});

export default PageHeader;
