import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';

interface MethodologyPageProps {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    accentColor: string;
}

/**
 * Página de Metodologia
 */
export const MethodologyPage: React.FC<MethodologyPageProps> = ({
    styles,
    broker,
    totalPages,
    accentColor,
}) => {
    return (
        <Page size="A4" style={styles.page}>
            {/* Background Gradients */}
            {/* Background simplified */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 350,
                    height: 350,
                    backgroundColor: `${accentColor}33`,
                    borderRadius: 175,
                }}
            />

            <PdfHeader
                styles={styles}
                title="Metodologia"
                badge="Fundamentos Técnicos"
                broker={broker}
                accentColor={accentColor}
            />

            <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                {/* Título da seção */}
                <Text style={{ ...styles.h3, marginBottom: 16 }}>
                    Como calculamos o valor do seu imóvel
                </Text>

                {/* Card 1: Método Comparativo */}
                <View style={{ ...styles.card, marginBottom: 16 }}>
                    <View
                        style={{
                            ...styles.flexRow,
                            ...styles.alignCenter,
                            ...styles.gap8,
                            marginBottom: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>1</Text>
                        </View>
                        <Text style={{ ...styles.h4, fontSize: 12 }}>
                            Método Comparativo Direto de Dados de Mercado
                        </Text>
                    </View>
                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        Analisamos imóveis <Text style={{ fontWeight: 600 }}>similares</Text> em{' '}
                        <Text style={{ fontWeight: 600 }}>localização</Text>,{' '}
                        <Text style={{ fontWeight: 600 }}>tamanho</Text> e{' '}
                        <Text style={{ fontWeight: 600 }}>características</Text> que estão atualmente à
                        venda ou foram recentemente vendidos na sua região.
                    </Text>
                </View>

                {/* Card 2: Análise de Dados */}
                <View style={{ ...styles.card, marginBottom: 16 }}>
                    <View
                        style={{
                            ...styles.flexRow,
                            ...styles.alignCenter,
                            ...styles.gap8,
                            marginBottom: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>2</Text>
                        </View>
                        <Text style={{ ...styles.h4, fontSize: 12 }}>Análise de Dados Reais</Text>
                    </View>
                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        Coletamos dados de <Text style={{ fontWeight: 600 }}>portais imobiliários</Text>,{' '}
                        <Text style={{ fontWeight: 600 }}>corretores parceiros</Text> e{' '}
                        <Text style={{ fontWeight: 600 }}>registros públicos</Text> para garantir que a
                        análise seja baseada em informações atualizadas e confiáveis.
                    </Text>
                </View>

                {/* Card 3: Ajustes e Fatores */}
                <View style={{ ...styles.card, marginBottom: 16 }}>
                    <View
                        style={{
                            ...styles.flexRow,
                            ...styles.alignCenter,
                            ...styles.gap8,
                            marginBottom: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>3</Text>
                        </View>
                        <Text style={{ ...styles.h4, fontSize: 12 }}>Ajustes de Comparabilidade</Text>
                    </View>
                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        Consideramos fatores que influenciam o valor como{' '}
                        <Text style={{ fontWeight: 600 }}>acabamentos</Text>,{' '}
                        <Text style={{ fontWeight: 600 }}>conservação</Text>,{' '}
                        <Text style={{ fontWeight: 600 }}>infraestrutura do bairro</Text> e{' '}
                        <Text style={{ fontWeight: 600 }}>tendências do mercado local</Text>.
                    </Text>
                </View>

                {/* Info Card */}
                <View
                    style={{
                        backgroundColor: `${accentColor}26`,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: `${accentColor}66`,
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <Text style={{ ...styles.h4, fontSize: 11, marginBottom: 6, color: accentColor }}>
                        Por que confiamos neste método?
                    </Text>
                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        O Método Comparativo Direto é amplamente reconhecido como o mais confiável para
                        avaliações imobiliárias residenciais e comerciais. É o mesmo método utilizado por{' '}
                        <Text style={{ fontWeight: 600 }}>bancos</Text>,{' '}
                        <Text style={{ fontWeight: 600 }}>peritos judiciais</Text> e{' '}
                        <Text style={{ fontWeight: 600 }}>avaliadores certificados</Text> em todo o mundo.
                    </Text>
                </View>
            </View>

            <PdfFooter styles={styles} pageNumber={2} totalPages={totalPages} />
        </Page>
    );
};
