import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { SampleData, BrokerData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';
import { formatMoney, formatPricePerM2 } from '../utils';

interface SamplePageProps {
    styles: PdfStyleSheet;
    sample: SampleData;
    sampleNumber: number;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Amostra Individual
 */
export const SamplePage: React.FC<SamplePageProps> = ({
    styles,
    sample,
    sampleNumber,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    const statusBadge = sample.status === 'vendido' ? 'Vendido' : 'À Venda';
    const statusColor = sample.status === 'vendido' ? accentColor : '#60a5fa';

    return (
        <Page size="A4" style={styles.page}>
            <PdfHeader
                styles={styles}
                title={`Amostra ${sampleNumber}`}
                badge={statusBadge}
                broker={broker}
                accentColor={statusColor}
            />

            <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                {/* Title */}
                <Text style={{ ...styles.h3, marginBottom: 4 }}>{sample.titulo}</Text>
                {sample.categoria && (
                    <Text style={{ ...styles.bodySmall, marginBottom: 16, color: accentColor }}>
                        {sample.categoria}
                    </Text>
                )}

                {/* Images Section - Smart Layout based on count */}
                {(() => {
                    // Combine main image with extras for total image pool
                    const allImages: string[] = [];
                    if (sample.imagem) allImages.push(sample.imagem);
                    if (sample.imagens && sample.imagens.length > 0) {
                        allImages.push(...sample.imagens);
                    }

                    if (allImages.length === 0) return null;

                    // 1 imagem: Mostra grande, full width
                    if (allImages.length === 1) {
                        return (
                            <View style={{ marginBottom: 16 }}>
                                <Image
                                    src={allImages[0]}
                                    style={{
                                        width: '100%',
                                        height: 220,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                    }}
                                />
                            </View>
                        );
                    }

                    // 2 imagens: Uma grande em cima, outra menor embaixo centralizada
                    if (allImages.length === 2) {
                        return (
                            <View style={{ marginBottom: 16 }}>
                                <Image
                                    src={allImages[0]}
                                    style={{
                                        width: '100%',
                                        height: 180,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                        marginBottom: 8,
                                    }}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <Image
                                        src={allImages[1]}
                                        style={{
                                            width: '60%',
                                            height: 100,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                        }}
                                    />
                                </View>
                            </View>
                        );
                    }

                    // 3+ imagens: Grande em cima + grid 2x2 embaixo (máx 4 extras)
                    return (
                        <View style={{ marginBottom: 16 }}>
                            {/* Main image */}
                            <Image
                                src={allImages[0]}
                                style={{
                                    width: '100%',
                                    height: 160,
                                    objectFit: 'cover',
                                    borderRadius: 12,
                                    marginBottom: 8,
                                }}
                            />
                            {/* Grid de imagens secundárias (2 por linha) */}
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: allImages.length > 3 ? 8 : 0 }}>
                                {allImages.slice(1, 3).map((img, idx) => (
                                    <View key={idx} style={{ flex: 1 }}>
                                        <Image
                                            src={img}
                                            style={{
                                                width: '100%',
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                            {/* Segunda linha se tiver 4+ imagens */}
                            {allImages.length > 3 && (
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {allImages.slice(3, 5).map((img, idx) => (
                                        <View key={idx + 2} style={{ flex: 1 }}>
                                            <Image
                                                src={img}
                                                style={{
                                                    width: '100%',
                                                    height: 80,
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                }}
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })()}

                {/* Location & Value */}
                <View style={{ ...styles.flexRow, ...styles.gap12, marginBottom: 16 }}>
                    {/* Location */}
                    <View style={{ ...styles.card, flex: 1.2 }}>
                        <Text style={{ ...styles.label, marginBottom: 4 }}>Localização</Text>
                        {sample.rua && (
                            <Text style={{ ...styles.bodySmall, marginBottom: 2 }}>
                                {sample.rua}
                            </Text>
                        )}
                        <Text style={{ ...styles.body, fontSize: 10, fontWeight: 600 }}>
                            {sample.bairro || 'N/A'}
                        </Text>
                        <Text style={{ ...styles.bodySmall }}>
                            {sample.municipio || 'N/A'} - {sample.estado || 'N/A'}
                        </Text>
                    </View>

                    {/* Value */}
                    <View
                        style={{
                            ...styles.card,
                            flex: 1,
                            backgroundColor: `${accentColor}20`,
                            borderColor: `${accentColor}66`,
                        }}
                    >
                        <Text style={{ ...styles.label, marginBottom: 4, color: accentColor }}>
                            Valor
                        </Text>
                        <Text style={{ ...styles.h4, fontSize: 14, color: accentColor }}>
                            {formatMoney(sample.valor)}
                        </Text>
                        <Text style={{ ...styles.bodySmall, marginTop: 2 }}>
                            {formatPricePerM2(sample.valor, sample.area)}/m²
                        </Text>
                    </View>
                </View>

                {/* Specifications Grid - Keep together */}
                <View style={{ ...styles.card, marginBottom: 16 }} wrap={false}>
                    <Text style={{ ...styles.label, marginBottom: 8 }}>Especificações</Text>

                    <View style={{ ...styles.flexRow, gap: 12 }}>
                        {/* Left Column */}
                        <View style={{ flex: 1, gap: 6 }}>
                            <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                <Text style={{ ...styles.bodySmall }}>Área:</Text>
                                <Text style={{ ...styles.bodySmall, fontWeight: 600 }}>
                                    {sample.area}m²
                                </Text>
                            </View>

                            <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                <Text style={{ ...styles.bodySmall }}>Quartos:</Text>
                                <Text style={{ ...styles.bodySmall, fontWeight: 600 }}>
                                    {sample.quartos}
                                </Text>
                            </View>

                            {sample.suites > 0 && (
                                <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                    <Text style={{ ...styles.bodySmall }}>Suítes:</Text>
                                    <Text style={{ ...styles.bodySmall, fontWeight: 600 }}>
                                        {sample.suites}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Right Column */}
                        <View style={{ flex: 1, gap: 6 }}>
                            <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                <Text style={{ ...styles.bodySmall }}>Banheiros:</Text>
                                <Text style={{ ...styles.bodySmall, fontWeight: 600 }}>
                                    {sample.banheiros}
                                </Text>
                            </View>

                            <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                <Text style={{ ...styles.bodySmall }}>Vagas:</Text>
                                <Text style={{ ...styles.bodySmall, fontWeight: 600 }}>
                                    {sample.vagas}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description - Keep together, don't break across pages */}
                {sample.descricao && (
                    <View style={styles.card} wrap={false}>
                        <Text style={{ ...styles.label, marginBottom: 6 }}>Descrição</Text>
                        <Text style={{ ...styles.body, fontSize: 8, lineHeight: 1.4 }}>
                            {sample.descricao.length > 600
                                ? sample.descricao.substring(0, 600) + '...'
                                : sample.descricao}
                        </Text>
                    </View>
                )}

                {/* Link (if available) */}
                {sample.link && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={{ ...styles.bodySmall, color: accentColor }}>
                            Link: {sample.link}
                        </Text>
                    </View>
                )}
            </View>

            <PdfFooter styles={styles} pageNumber={pageNumber} totalPages={totalPages} />
        </Page>
    );
};
