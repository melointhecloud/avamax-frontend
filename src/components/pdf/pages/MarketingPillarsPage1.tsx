import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';

interface MarketingPillarsPage1Props {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Pilares Estratégicos - Parte 1
 * 
 * Mostra os 3 primeiros pilares do plano de marketing:
 * 1. Precificação Inteligente
 * 2. Conteúdo e Apresentação
 * 3. Experiência do Cliente
 */
export const MarketingPillarsPage1: React.FC<MarketingPillarsPage1Props> = ({
    styles,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    const pillarStyles = StyleSheet.create({
        pillarCard: {
            backgroundColor: '#3B82F610',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#3B82F633',
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
        },
        pillarHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 16,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
        },
        badge: {
            fontSize: 7,
            fontWeight: 700,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            marginBottom: 8,
        },
        pillarTitle: {
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 8,
        },
        pillarDescription: {
            fontSize: 11,
            lineHeight: 1.6,
            color: '#BFDBFE99',
            marginBottom: 12,
        },
        checkItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
        },
        checkText: {
            fontSize: 9,
            color: '#BFDBFE99',
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={{ ...styles.label, color: '#FB923C', marginBottom: 4 }}>
                        FUNDAMENTOS
                    </Text>
                    <Text style={styles.h2}>Pilares Estratégicos</Text>
                </View>
                {broker?.logo_imobiliaria_url && (
                    <View style={{
                        width: 48,
                        height: 48, borderRadius: 12,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: `${accentColor}66`,
                        overflow: 'hidden'
                    }} />
                )}
            </View>

            {/* Content */}
            <View style={{ padding: 32, flex: 1 }}>

                {/* Pilar 1: Precificação Inteligente */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        {/* Icon placeholder (PDF doesn't support complex icons) */}
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#10B98120',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>01</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Precificação Inteligente</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                A precificação correta é o fundamento de qualquer venda bem-sucedida.
                                Utilizamos análise de dados de mercado para posicionar o imóvel de forma competitiva.
                            </Text>

                            <View style={{ gap: 6 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Análise de comparativos</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Faixas de preço estratégicas</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pilar 2: Conteúdo e Apresentação */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#A855F720',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#A855F7' }}>02</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Conteúdo e Apresentação</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                A primeira impressão é decisiva. Investimos em produção visual de alto padrão
                                e narrativa que destaca os diferenciais do imóvel.
                            </Text>

                            <View style={{ gap: 6 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#A855F7' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Fotos e vídeos profissionais</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#A855F7' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Tour virtual 360°</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pilar 3: Experiência do Cliente */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#3B82F620',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#3B82F6' }}>03</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Experiência do Cliente</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                Cada interação com o comprador é uma oportunidade de encantar. Criamos
                                experiências memoráveis em todas as etapas do processo.
                            </Text>

                            <View style={{ gap: 6 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#3B82F6' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Visitas personalizadas</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#3B82F6' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Atendimento consultivo</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Note */}
                <View style={{
                    marginTop: 'auto',
                    padding: 16,
                    backgroundColor: '#F3F4F610',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: '#E5E7EB20'
                }}>
                    <Text style={{ fontSize: 8, lineHeight: 1.5, color: '#9CA3AF' }}>
                        <Text style={{ fontWeight: 600 }}>Nota:</Text> Cada pilar é parte de uma estratégia
                        integrada desenhada para maximizar o valor do seu imóvel e acelerar a venda.
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
