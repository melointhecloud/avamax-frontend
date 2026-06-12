import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { PropertyData, MarketData, BrokerData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';
import { formatMoney, formatPricePerM2 } from '../utils';

interface ConclusionPageProps {
    styles: PdfStyleSheet;
    property: PropertyData;
    market: MarketData;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Conclusão
 */
export const ConclusionPage: React.FC<ConclusionPageProps> = ({
    styles,
    property,
    market,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    return (
        <Page size="A4" style={styles.page}>
            {/* Background Gradients */}
            {/* Background simplified */}
            <View
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    width: 400,
                    height: 400,
                    backgroundColor: '#1E40AF33',
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
                    backgroundColor: `${accentColor}40`,
                    borderRadius: 175,
                }}
            />

            <PdfHeader
                styles={styles}
                title="Conclusão do Estudo"
                badge="Parecer Final"
                broker={broker}
                accentColor={accentColor}
            />

            <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                {/* Property Summary */}
                <View style={{ ...styles.flexRow, ...styles.gap16, marginBottom: 24 }}>
                    {/* Property Image */}
                    <View style={{ width: 160, height: 120, borderRadius: 12, overflow: 'hidden' }}>
                        {property.foto_capa ? (
                            <Image
                                src={property.foto_capa}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(30, 64, 175, 0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontSize: 24, opacity: 0.3, color: '#1E40AF' }}>■</Text>
                            </View>
                        )}
                    </View>

                    {/* Property Details */}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ ...styles.h3, fontSize: 16 }}>{property.bairro}</Text>
                            <Text style={{ ...styles.body, marginTop: 2 }}>
                                {property.municipio} - {property.estado}
                            </Text>
                            <View style={{ ...styles.flexRow, ...styles.gap8, marginTop: 6 }}>
                                <Text style={{ ...styles.badge, fontSize: 7 }}>{property.area}m²</Text>
                                <Text style={{ ...styles.badge, fontSize: 7 }}>
                                    {property.quartos} quartos
                                </Text>
                                {property.suites > 0 && (
                                    <Text style={{ ...styles.badge, fontSize: 7 }}>
                                        {property.suites} suítes
                                    </Text>
                                )}
                                <Text style={{ ...styles.badge, fontSize: 7 }}>
                                    {property.banheiros} banheiros
                                </Text>
                            </View>
                        </View>

                        {/* Estimated Value */}
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ ...styles.label, fontSize: 7 }}>Valor de Mercado</Text>
                            <Text style={{ ...styles.h3, color: accentColor }}>
                                {formatMoney(market.valor_estimado)}
                            </Text>
                            <Text style={{ ...styles.bodySmall, opacity: 0.7 }}>
                                {formatPricePerM2(market.valor_estimado, property.area)}/m²
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Conclusion Text */}
                <View style={{ ...styles.card, marginBottom: 20 }}>
                    <Text style={{ ...styles.h4, fontSize: 12, marginBottom: 10 }}>
                        Parecer do Estudo de Mercado
                    </Text>
                    <Text style={{ ...styles.body, lineHeight: 1.6, marginBottom: 10 }}>
                        Com base na análise de{' '}
                        <Text style={{ fontWeight: 600, color: accentColor }}>
                            {market.amostras} imóveis comparáveis
                        </Text>{' '}
                        na região de{' '}
                        <Text style={{ fontWeight: 600 }}>
                            {property.bairro}, {property.municipio}
                        </Text>
                        , e considerando as características específicas do imóvel em questão, concluímos que
                        o valor de mercado estimado é de{' '}
                        <Text style={{ fontWeight: 700, color: accentColor }}>
                            {formatMoney(market.valor_estimado)}
                        </Text>
                        .
                    </Text>
                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        Este estudo foi conduzido utilizando metodologia de Método Comparativo Direto,
                        amplamente reconhecida no mercado imobiliário. O acompanhamento profissional do
                        corretor responsável é fundamental para o sucesso da comercialização.
                    </Text>
                </View>

                {/* Broker Signature */}
                {broker && (
                    <View
                        style={{
                            backgroundColor: `${accentColor}20`,
                            borderWidth: 2,
                            borderStyle: 'solid',
                            borderColor: `${accentColor}66`,
                            borderRadius: 16,
                            padding: 20,
                            flex: 1,
                        }}
                    >
                        <View style={{ ...styles.flexRow, ...styles.gap16, ...styles.alignCenter }}>
                            {/* Agency Logo */}
                            {broker.logo_imobiliaria_url && (
                                <Image
                                    src={broker.logo_imobiliaria_url}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderStyle: 'solid',
                                        borderColor: `${accentColor}99`,
                                    }}
                                />
                            )}

                            {/* Agency Info */}
                            <View style={{ flex: 1 }}>
                                {broker.imobiliaria && (
                                    <Text style={{ ...styles.h4, fontSize: 13, marginBottom: 4 }}>
                                        {broker.imobiliaria}
                                    </Text>
                                )}
                                {broker.telefone_imobiliaria && (
                                    <Text style={{ ...styles.bodySmall, marginBottom: 2 }}>
                                        Tel: {broker.telefone_imobiliaria}
                                    </Text>
                                )}
                            </View>

                            {/* Broker Info */}
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                {broker.avatar_url && (
                                    <Image
                                        src={broker.avatar_url}
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 12,
                                            borderWidth: 2,
                                            borderStyle: 'solid',
                                            borderColor: `${accentColor}99`,
                                            marginBottom: 8,
                                        }}
                                    />
                                )}
                                {broker.nome && (
                                    <Text style={{ ...styles.h4, fontSize: 11, textAlign: 'right' }}>
                                        {broker.nome}
                                    </Text>
                                )}
                                {broker.creci && (
                                    <Text
                                        style={{ ...styles.bodySmall, textAlign: 'right', color: accentColor }}
                                    >
                                        CRECI: {broker.creci}
                                    </Text>
                                )}
                                {broker.telefone && (
                                    <Text style={{ ...styles.bodySmall, textAlign: 'right', marginTop: 4 }}>
                                        {broker.telefone}
                                    </Text>
                                )}
                                {broker.email && (
                                    <Text style={{ ...styles.bodySmall, textAlign: 'right' }}>
                                        {broker.email}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </View>

            <PdfFooter styles={styles} pageNumber={pageNumber} totalPages={totalPages} />
        </Page>
    );
};
