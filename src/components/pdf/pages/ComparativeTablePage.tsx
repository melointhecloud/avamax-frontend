import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { SampleData, PropertyData, BrokerData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';
import { formatMoney, formatPricePerM2 } from '../utils';

// Número máximo de amostras por página
const SAMPLES_PER_PAGE = 6;

interface ComparativeTablePageProps {
    styles: PdfStyleSheet;
    property: PropertyData;
    samples: SampleData[];
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
    marketAverage?: number;
}

/**
 * Quebra samples em chunks de 6 para múltiplas páginas
 */
function chunkSamples<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

/**
 * Componente de uma única página de tabela comparativa
 */
const ComparativeTableSinglePage: React.FC<{
    styles: PdfStyleSheet;
    property: PropertyData;
    pageSamples: SampleData[];
    allSamples: SampleData[];
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
    tablePageIndex: number;
    totalTablePages: number;
    showPropertyRow: boolean;
    showSummary: boolean;
    marketAverage?: number;
}> = ({
    styles,
    property,
    pageSamples,
    allSamples,
    broker,
    totalPages,
    pageNumber,
    accentColor,
    tablePageIndex,
    totalTablePages,
    showPropertyRow,
    showSummary,
}) => {
        // Calcula estatísticas baseadas em TODAS as amostras
        const totalSampleCount = allSamples.length;
        const avgPricePerM2 = totalSampleCount > 0
            ? allSamples.reduce((acc, s) => acc + (s.area > 0 ? s.valor / s.area : 0), 0) / totalSampleCount
            : 0;

        // Offset para numeração correta das amostras
        const sampleOffset = tablePageIndex * SAMPLES_PER_PAGE;

        return (
            <Page size="A4" style={styles.page} orientation="portrait">
                <PdfHeader
                    styles={styles}
                    title={`Quadro Comparativo${totalTablePages > 1 ? ` (${tablePageIndex + 1}/${totalTablePages})` : ''}`}
                    badge="Análise de Mercado"
                    broker={broker}
                    accentColor={accentColor}
                />

                <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                    {tablePageIndex === 0 && (
                        <Text style={{ ...styles.body, marginBottom: 16, textAlign: 'center' }}>
                            Comparação entre o imóvel avaliado e as amostras de mercado
                        </Text>
                    )}

                    {/* Table */}
                    <View
                        style={{
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: '#3B82F633',
                            borderRadius: 8,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header Row */}
                        <View
                            style={{
                                ...styles.flexRow,
                                backgroundColor: `${accentColor}33`,
                                borderBottomWidth: 1,
                                borderBottomStyle: 'solid',
                                borderBottomColor: '#3B82F633',
                                padding: 8,
                            }}
                        >
                            <View style={{ width: '30%' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Imóvel</Text>
                            </View>
                            <View style={{ width: '12%', textAlign: 'center' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Área</Text>
                            </View>
                            <View style={{ width: '8%', textAlign: 'center' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Qt</Text>
                            </View>
                            <View style={{ width: '8%', textAlign: 'center' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Bn</Text>
                            </View>
                            <View style={{ width: '8%', textAlign: 'center' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Vg</Text>
                            </View>
                            <View style={{ width: '18%', textAlign: 'right' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>Valor</Text>
                            </View>
                            <View style={{ width: '16%', textAlign: 'right' }}>
                                <Text style={{ ...styles.label, fontSize: 7 }}>R$/m²</Text>
                            </View>
                        </View>

                        {/* Property Row (only on first page) */}
                        {showPropertyRow && (
                            <View
                                style={{
                                    ...styles.flexRow,
                                    backgroundColor: `${accentColor}1a`,
                                    borderBottomWidth: 2,
                                    borderBottomStyle: 'solid',
                                    borderBottomColor: `${accentColor}66`,
                                    padding: 8,
                                }}
                            >
                                <View style={{ width: '30%' }}>
                                    <Text
                                        style={{ ...styles.body, fontSize: 8, fontWeight: 700, color: accentColor }}
                                    >
                                        Imóvel Avaliado
                                    </Text>
                                    <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                        {property.bairro}, {property.municipio}
                                    </Text>
                                </View>
                                <View style={{ width: '12%', textAlign: 'center' }}>
                                    <Text style={{ ...styles.body, fontSize: 8 }}>{property.area}m²</Text>
                                </View>
                                <View style={{ width: '8%', textAlign: 'center' }}>
                                    <Text style={{ ...styles.body, fontSize: 8 }}>{property.quartos}</Text>
                                </View>
                                <View style={{ width: '8%', textAlign: 'center' }}>
                                    <Text style={{ ...styles.body, fontSize: 8 }}>{property.banheiros}</Text>
                                </View>
                                <View style={{ width: '8%', textAlign: 'center' }}>
                                    <Text style={{ ...styles.body, fontSize: 8 }}>{property.vagas}</Text>
                                </View>
                                <View style={{ width: '18%', textAlign: 'right' }}>
                                    <Text style={{ ...styles.body, fontSize: 8, color: accentColor }}>
                                        {property.valor_atual ? formatMoney(property.valor_atual) : '-'}
                                    </Text>
                                </View>
                                <View style={{ width: '16%', textAlign: 'right' }}>
                                    <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                        {property.valor_atual
                                            ? formatPricePerM2(property.valor_atual, property.area)
                                            : '-'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Sample Rows */}
                        {pageSamples.map((sample, idx) => {
                            const globalIdx = sampleOffset + idx;
                            return (
                                <View
                                    key={sample.id}
                                    style={{
                                        ...styles.flexRow,
                                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                        borderBottomWidth: idx < pageSamples.length - 1 ? 1 : 0,
                                        borderBottomStyle: 'solid',
                                        borderBottomColor: '#3B82F633',
                                        padding: 8,
                                    }}
                                >
                                    <View style={{ width: '30%' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>
                                            Amostra {globalIdx + 1}
                                        </Text>
                                        <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                            {sample.bairro || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={{ width: '12%', textAlign: 'center' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>{sample.area}m²</Text>
                                    </View>
                                    <View style={{ width: '8%', textAlign: 'center' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>{sample.quartos}</Text>
                                    </View>
                                    <View style={{ width: '8%', textAlign: 'center' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>{sample.banheiros}</Text>
                                    </View>
                                    <View style={{ width: '8%', textAlign: 'center' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>{sample.vagas}</Text>
                                    </View>
                                    <View style={{ width: '18%', textAlign: 'right' }}>
                                        <Text style={{ ...styles.body, fontSize: 8 }}>
                                            {formatMoney(sample.valor)}
                                        </Text>
                                    </View>
                                    <View style={{ width: '16%', textAlign: 'right' }}>
                                        <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                            {formatPricePerM2(sample.valor, sample.area)}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Summary Stats - only on last table page */}
                    {showSummary && (
                        <>
                            <View style={{ ...styles.flexRow, ...styles.gap12, marginTop: 16 }}>
                                <View style={{ ...styles.card, flex: 1, textAlign: 'center' }}>
                                    <Text style={{ ...styles.label, marginBottom: 4 }}>Amostras Analisadas</Text>
                                    <Text style={{ ...styles.h3, fontSize: 18 }}>{totalSampleCount}</Text>
                                </View>

                                <View style={{ ...styles.card, flex: 1, textAlign: 'center' }}>
                                    <Text style={{ ...styles.label, marginBottom: 4 }}>Valor Médio/m²</Text>
                                    <Text style={{ ...styles.h4, fontSize: 12, color: accentColor }}>
                                        {formatMoney(avgPricePerM2)}
                                    </Text>
                                </View>
                            </View>

                            {/* Legend */}
                            <View style={{ marginTop: 16, gap: 4 }}>
                                <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                    Qt = Quartos | Bn = Banheiros | Vg = Vagas
                                </Text>
                                <Text style={{ ...styles.bodySmall, fontSize: 7 }}>
                                    * Valores baseados em dados reais de mercado na data da avaliação
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <PdfFooter styles={styles} pageNumber={pageNumber} totalPages={totalPages} />
            </Page>
        );
    };

/**
 * Quadro Comparativo - Renderiza múltiplas páginas se necessário
 * Agora mostra TODAS as amostras, não apenas as primeiras 6
 */
export const ComparativeTablePage: React.FC<ComparativeTablePageProps> = ({
    styles,
    property,
    samples,
    broker,
    totalPages,
    pageNumber,
    accentColor,
    marketAverage,
}) => {
    // Divide amostras em chunks de 6 por página
    const sampleChunks = chunkSamples(samples, SAMPLES_PER_PAGE);
    const totalTablePages = sampleChunks.length || 1;

    // Se não houver amostras, renderiza uma página vazia
    if (sampleChunks.length === 0) {
        return (
            <ComparativeTableSinglePage
                styles={styles}
                property={property}
                pageSamples={[]}
                allSamples={samples}
                broker={broker}
                totalPages={totalPages}
                pageNumber={pageNumber}
                accentColor={accentColor}
                tablePageIndex={0}
                totalTablePages={1}
                showPropertyRow={true}
                showSummary={true}
                marketAverage={marketAverage}
            />
        );
    }

    // Renderiza múltiplas páginas
    return (
        <>
            {sampleChunks.map((chunk, idx) => (
                <ComparativeTableSinglePage
                    key={idx}
                    styles={styles}
                    property={property}
                    pageSamples={chunk}
                    allSamples={samples}
                    broker={broker}
                    totalPages={totalPages}
                    pageNumber={pageNumber + idx}
                    accentColor={accentColor}
                    tablePageIndex={idx}
                    totalTablePages={totalTablePages}
                    showPropertyRow={idx === 0}
                    showSummary={idx === totalTablePages - 1}
                    marketAverage={marketAverage}
                />
            ))}
        </>
    );
};
