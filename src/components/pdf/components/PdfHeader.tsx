import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';

interface PdfHeaderProps {
    styles: PdfStyleSheet;
    title: string;
    subtitle?: string;
    badge?: string;
    broker?: BrokerData;
    showLogos?: boolean;
    accentColor?: string;
}

/**
 * Componente de Header reutilizável para páginas do PDF
 */
export const PdfHeader: React.FC<PdfHeaderProps> = ({
    styles,
    title,
    subtitle,
    badge,
    broker,
    showLogos = true,
    accentColor,
}) => {
    const avaluzLogoUrl = 'https://avaluz.com.br/logo.png'; // Ajustar para URL real

    return (
        <View style={styles.header}>
            {/* Left Side - Title */}
            <View style={{ flex: 1 }}>
                {badge && (
                    <View style={{ marginBottom: 8 }}>
                        <View
                            style={{
                                ...styles.badge,
                                backgroundColor: accentColor ? `${accentColor}33` : undefined,
                                color: accentColor || styles.badge.color,
                            }}
                        >
                            <Text>{badge}</Text>
                        </View>
                    </View>
                )}
                <Text style={styles.h2}>{title}</Text>
                {subtitle && (
                    <Text style={{ ...styles.body, marginTop: 4 }}>{subtitle}</Text>
                )}
            </View>

            {/* Right Side - Logos */}
            {showLogos && (
                <View style={{ ...styles.flexRow, ...styles.gap12, ...styles.alignCenter }}>
                    {broker?.logo_imobiliaria_url && (
                        <Image
                            src={broker.logo_imobiliaria_url}
                            style={{
                                ...styles.logo,
                                borderWidth: 2,
                                borderStyle: 'solid',
                                borderColor: `${accentColor || '#FF6B35'}66`,
                            }}
                        />
                    )}
                    {broker?.avatar_url && (
                        <Image
                            src={broker.avatar_url}
                            style={{
                                ...styles.avatarSmall,
                                borderWidth: 2,
                                borderStyle: 'solid',
                                borderColor: `${accentColor || '#FF6B35'}99`,
                            }}
                        />
                    )}
                    {/* Avaluz Logo - comentado até termos URL real */}
                    {/* <Image src={avaluzLogoUrl} style={{ width: 64, height: 'auto' }} /> */}
                </View>
            )}
        </View>
    );
};
