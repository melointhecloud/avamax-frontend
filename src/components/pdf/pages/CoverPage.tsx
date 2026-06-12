import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { PropertyData, MarketData, BrokerData, ClientData } from '../types';
import { formatMoney } from '../utils';

const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

interface CoverPageProps {
    styles: PdfStyleSheet;
    property: PropertyData;
    market: MarketData;
    broker?: BrokerData;
    client?: ClientData;
    clientName?: string;
    accentColor: string;
}

/**
 * Página de Capa do PDF
 */
export const CoverPage: React.FC<CoverPageProps> = ({
    styles,
    property,
    market,
    broker,
    client,
    clientName,
    accentColor,
}) => {
    const displayClientName = client?.nome || clientName || 'Cliente Avaluz';
    const hasClientData = Boolean(client?.nome || clientName);

    return (
        <Page size="A4" style={styles.page}>
            {/* Background Gradients */}
            {/* Background Gradients - simplified (no blur/percentage radius in @react-pdf/renderer) */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 400,
                    height: 400,
                    backgroundColor: `${accentColor}33`,
                    borderRadius: 200,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 350,
                    height: 350,
                    backgroundColor: '#1E40AF40',
                    borderRadius: 175,
                }}
            />

            {/* Content */}
            <View style={{ flex: 1, padding: 40, position: 'relative', zIndex: 10 }}>
                {/* Top Section - Logos */}
                <View
                    style={{
                        ...styles.flexRow,
                        ...styles.spaceBetween,
                        ...styles.alignCenter,
                        marginBottom: 40,
                    }}
                >
                    {broker?.logo_imobiliaria_url && (
                        <Image
                            src={broker.logo_imobiliaria_url}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderStyle: 'solid',
                                borderColor: `${accentColor}66`,
                            }}
                        />
                    )}
                    {/* Avaluz Logo Placeholder */}
                    <Text style={{ ...styles.h2, color: accentColor }}>AVALUZ</Text>
                </View>

                {/* Main Image */}
                {property.foto_capa && (
                    <Image
                        src={property.foto_capa}
                        style={{
                            width: '100%',
                            height: 300,
                            objectFit: 'cover',
                            borderRadius: 16,
                            marginBottom: 32,
                        }}
                    />
                )}

                {/* Title */}
                <Text
                    style={{
                        ...styles.label,
                        color: accentColor,
                        marginBottom: 8,
                    }}
                >
                    Avaliação Imobiliária
                </Text>
                <Text style={{ ...styles.h1, fontSize: 42, marginBottom: 24 }}>
                    Estudo de Mercado
                </Text>

                {/* Property Info Cards */}
                <View style={{ ...styles.flexRow, ...styles.gap16, marginBottom: 24 }}>
                    {/* Location Card */}
                    <View style={{ ...styles.card, flex: 1 }}>
                        <Text style={{ ...styles.label, marginBottom: 4 }}>Localização</Text>
                        <Text style={{ ...styles.h4, fontSize: 12 }}>{truncateText(property.bairro, 35)}</Text>
                        <Text style={styles.bodySmall}>
                            {truncateText(property.municipio, 20)} - {truncateText(property.estado, 20)}
                        </Text>
                    </View>

                    {/* Type Card */}
                    <View style={{ ...styles.card, flex: 1 }}>
                        <Text style={{ ...styles.label, marginBottom: 4 }}>Tipo</Text>
                        <Text style={{ ...styles.h4, fontSize: 12 }}>{truncateText(property.tipo, 35)}</Text>
                        <Text style={styles.bodySmall}>
                            {property.area}m² • {property.quartos}q • {property.banheiros}b
                        </Text>
                    </View>
                </View>

                {/* Value Card - Accent */}
                <View
                    style={{
                        ...styles.cardAccent,
                        borderColor: `${accentColor}99`,
                        backgroundColor: `${accentColor}26`,
                        marginBottom: 24,
                    }}
                >
                    <Text
                        style={{
                            ...styles.label,
                            color: accentColor,
                            marginBottom: 8,
                        }}
                    >
                        Valor Estimado de Mercado
                    </Text>
                    <Text style={{ ...styles.h1, fontSize: 36, color: accentColor }}>
                        {formatMoney(market.valor_estimado)}
                    </Text>
                    <Text style={{ ...styles.body, marginTop: 4 }}>
                        Baseado em {market.amostras} imóveis comparáveis • Confiança: {market.confianca}
                    </Text>
                </View>

                {/* Broker Info */}
                {broker && (
                    <View style={{ ...styles.flexRow, ...styles.gap16, ...styles.alignCenter }}>
                        {broker.avatar_url && (
                            <Image
                                src={broker.avatar_url}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderStyle: 'solid',
                                    borderColor: `${accentColor}99`,
                                }}
                            />
                        )}
                        <View style={{ flex: 1 }}>
                            {broker.nome && <Text style={styles.h4}>{truncateText(broker.nome, 35)}</Text>}
                            {broker.creci && (
                                <Text style={styles.bodySmall}>CRECI: {broker.creci}</Text>
                            )}
                            {broker.imobiliaria && (
                                <Text style={{ ...styles.bodySmall, color: accentColor }}>
                                    {truncateText(broker.imobiliaria, 40)}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Client Info (if presente) */}
                {hasClientData && (
                    <View style={{ marginTop: 16 }}>
                        <Text style={{ ...styles.label, marginBottom: 4 }}>Preparado para</Text>
                        <Text style={styles.h4}>{truncateText(displayClientName, 40)}</Text>
                    </View>
                )}
            </View>
        </Page>
    );
};
