import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';

interface MarketingBenefitsPageProps {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Benefícios do Plano de Marketing
 * 
 * Destaca os principais benefícios e resultados esperados
 */
export const MarketingBenefitsPage: React.FC<MarketingBenefitsPageProps> = ({
    styles,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    const benefitStyles = StyleSheet.create({
        benefitCard: {
            backgroundColor: '#F3F4F610',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#3B82F633',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
        },
        benefitHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
        },
        icon: {
            fontSize: 24,
        },
        benefitTitle: {
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
        },
        benefitText: {
            fontSize: 11,
            lineHeight: 1.6,
            color: '#BFDBFE99',
            marginBottom: 10,
        },
        metricBox: {
            padding: 12,
            backgroundColor: '#10B98110',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#10B98133',
            borderRadius: 8,
            marginTop: 8,
        },
        metricText: {
            fontSize: 9,
            fontWeight: 600,
            color: '#10B981',
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={{ ...styles.label, color: accentColor, marginBottom: 4 }}>
                        RESULTADOS
                    </Text>
                    <Text style={styles.h2}>Benefícios do Plano</Text>
                </View>
                {broker?.logo_imobiliaria_url && (
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: `${accentColor}66`,
                        overflow: 'hidden'
                    }} />
                )}
            </View>

            {/* Content */}
            <View style={{ padding: 32, flex: 1 }}>

                {/* Intro */}
                <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#BFDBFE99', marginBottom: 24 }}>
                    A implementação do plano de marketing traz <Text style={{ fontWeight: 600, color: '#FFFFFF' }}>resultados
                        mensuráveis</Text> que aceleram a venda e maximizam o valor do imóvel.
                </Text>

                {/* Benefit 1 */}
                <View style={benefitStyles.benefitCard}>
                    <View style={benefitStyles.benefitHeader}>
                        <Text style={benefitStyles.benefitTitle}>Redução do Tempo de Venda</Text>
                    </View>
                    <Text style={benefitStyles.benefitText}>
                        Com divulgação estratégica e ampla visibilidade, o imóvel alcança compradores qualificados
                        mais rapidamente, reduzindo o tempo médio de comercialização.
                    </Text>
                    <View style={benefitStyles.metricBox}>
                        <Text style={benefitStyles.metricText}>
                            Redução média de 30-40% no tempo de venda comparado ao mercado tradicional
                        </Text>
                    </View>
                </View>

                {/* Benefit 2 */}
                <View style={benefitStyles.benefitCard}>
                    <View style={benefitStyles.benefitHeader}>
                        <Text style={benefitStyles.benefitTitle}>Maximização do Valor</Text>
                    </View>
                    <Text style={benefitStyles.benefitText}>
                        Apresentação profissional e precificação baseada em dados aumentam a percepção de valor,
                        permitindo negociações mais favoráveis.
                    </Text>
                    <View style={benefitStyles.metricBox}>
                        <Text style={benefitStyles.metricText}>
                            Potencial de valorização de 5-15% acima do valor inicial estimado
                        </Text>
                    </View>
                </View>

                {/* Benefit 3 */}
                <View style={benefitStyles.benefitCard}>
                    <View style={benefitStyles.benefitHeader}>
                        <Text style={benefitStyles.benefitTitle}>Maior Alcance de Compradores</Text>
                    </View>
                    <Text style={benefitStyles.benefitText}>
                        Publicidade digital segmentada e presença em múltiplos canais garantem exposição massiva
                        ao público-alvo correto.
                    </Text>
                    <View style={benefitStyles.metricBox}>
                        <Text style={benefitStyles.metricText}>
                            Aumento de 3-5x no número de visualizações e contatos qualificados
                        </Text>
                    </View>
                </View>

                {/* Benefit 4 */}
                <View style={benefitStyles.benefitCard}>
                    <View style={benefitStyles.benefitHeader}>
                        <Text style={benefitStyles.benefitTitle}>Qualificação de Leads</Text>
                    </View>
                    <Text style={benefitStyles.benefitText}>
                        Estratégias de marketing digital permitem filtrar e qualificar interessados reais,
                        otimizando o tempo e esforço da negociação.
                    </Text>
                    <View style={benefitStyles.metricBox}>
                        <Text style={benefitStyles.metricText}>
                            Taxa de conversão de visitas para propostas aumenta em 40-60%
                        </Text>
                    </View>
                </View>

                {/* Bottom Summary */}
                <View style={{
                    marginTop: 'auto',
                    padding: 16,
                    backgroundColor: `${accentColor}1a`,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: `${accentColor}33`
                }}>
                    <Text style={{ fontSize: 10, lineHeight: 1.6, fontWeight: 600, color: accentColor }}>
                        🚀 Resultado Final: Venda mais rápida, pelo melhor preço, com segurança e tranquilidade em todo o processo.
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Avaluz • Plano de Marketing</Text>
                <Text style={styles.footerText}>
                    {String(pageNumber).padStart(2, '0')} / {totalPages}
                </Text>
            </View>
        </Page>
    );
};
