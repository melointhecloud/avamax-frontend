import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';

interface MarketingFunnelPageProps {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página do Funil de Vendas
 * 
 * Mostra as 5 etapas do processo de venda com ações específicas em cada fase
 */
export const MarketingFunnelPage: React.FC<MarketingFunnelPageProps> = ({
    styles,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    const funnelStyles = StyleSheet.create({
        stageCard: {
            backgroundColor: '#F3F4F610',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
            flexDirection: 'row',
            gap: 12,
        },
        stageNumber: {
            width: 40,
            height: 40,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
        },
        stageTitle: {
            fontSize: 14,
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 8,
        },
        stageRow: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 6,
        },
        stageLabel: {
            fontSize: 9,
            fontWeight: 600,
            minWidth: 48,
        },
        stageText: {
            fontSize: 9,
            color: '#BFDBFE99',
            flex: 1,
        },
        impactBox: {
            marginTop: 10,
            padding: 8,
            borderRadius: 8,
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
        },
        impactText: {
            fontSize: 8,
            fontWeight: 600,
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={{ ...styles.label, color: '#FBBF24', marginBottom: 4 }}>
                        FUNIL DE VENDAS
                    </Text>
                    <Text style={styles.h2}>Ações de Marketing</Text>
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

            {/* Intro */}
            <View style={{ padding: 32, paddingBottom: 16 }}>
                <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#BFDBFE99' }}>
                    As ações de marketing seguem um <Text style={{ fontWeight: 600, color: '#FFFFFF' }}>funil estruturado</Text>,
                    onde cada etapa prepara o terreno para a próxima.
                </Text>
            </View>

            {/* Funnel Stages */}
            <View style={{ paddingHorizontal: 32, paddingBottom: 32, flex: 1 }}>

                {/* Stage 1 */}
                <View style={{ ...funnelStyles.stageCard, borderColor: '#3B82F633' }}>
                    <View style={{ ...funnelStyles.stageNumber, backgroundColor: '#3B82F6' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>1</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={funnelStyles.stageTitle}>Estrutura e Segurança</Text>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#3B82F6' }}>O que:</Text>
                            <Text style={funnelStyles.stageText}>Organização documental e análise jurídica.</Text>
                        </View>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#3B82F6' }}>Por que:</Text>
                            <Text style={funnelStyles.stageText}>Processo seguro com documentação em ordem.</Text>
                        </View>
                        <View style={{ ...funnelStyles.impactBox, backgroundColor: '#10B98110', borderWidth: 1, borderStyle: 'solid', borderColor: '#10B98133' }}>
                            <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                            <Text style={{ ...funnelStyles.impactText, color: '#10B981' }}>
                                Evita problemas e transmite confiança.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stage 2 */}
                <View style={{ ...funnelStyles.stageCard, borderColor: '#14B8A633' }}>
                    <View style={{ ...funnelStyles.stageNumber, backgroundColor: '#14B8A6' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>2</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={funnelStyles.stageTitle}>Preparação e Apresentação</Text>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#14B8A6' }}>O que:</Text>
                            <Text style={funnelStyles.stageText}>Home staging, fotos e vídeos profissionais.</Text>
                        </View>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#14B8A6' }}>Por que:</Text>
                            <Text style={funnelStyles.stageText}>Primeira impressão visual define decisão.</Text>
                        </View>
                        <View style={{ ...funnelStyles.impactBox, backgroundColor: '#10B98110', borderWidth: 1, borderStyle: 'solid', borderColor: '#10B98133' }}>
                            <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                            <Text style={{ ...funnelStyles.impactText, color: '#10B981' }}>
                                Destaque em portais e redes sociais.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stage 3 */}
                <View style={{ ...funnelStyles.stageCard, borderColor: '#FB923C33' }}>
                    <View style={{ ...funnelStyles.stageNumber, backgroundColor: '#FB923C' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>3</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={funnelStyles.stageTitle}>Divulgação Estratégica</Text>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#FB923C' }}>O que:</Text>
                            <Text style={funnelStyles.stageText}>Publicação em portais, redes sociais e anúncios.</Text>
                        </View>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#FB923C' }}>Por que:</Text>
                            <Text style={funnelStyles.stageText}>Alcançar compradores qualificados.</Text>
                        </View>
                        <View style={{ ...funnelStyles.impactBox, backgroundColor: '#10B98110', borderWidth: 1, borderStyle: 'solid', borderColor: '#10B98133' }}>
                            <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                            <Text style={{ ...funnelStyles.impactText, color: '#10B981' }}>
                                Gera fluxo constante de interessados.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stage 4 */}
                <View style={{ ...funnelStyles.stageCard, borderColor: '#EC489833' }}>
                    <View style={{ ...funnelStyles.stageNumber, backgroundColor: '#EC4899' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>4</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={funnelStyles.stageTitle}>Conversão</Text>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#EC4899' }}>O que:</Text>
                            <Text style={funnelStyles.stageText}>Visitas, negociação e fechamento.</Text>
                        </View>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#EC4899' }}>Por que:</Text>
                            <Text style={funnelStyles.stageText}>Transformar interesse em venda real.</Text>
                        </View>
                        <View style={{ ...funnelStyles.impactBox, backgroundColor: '#10B98110', borderWidth: 1, borderStyle: 'solid', borderColor: '#10B98133' }}>
                            <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                            <Text style={{ ...funnelStyles.impactText, color: '#10B981' }}>
                                Acelera fechamento com negociação.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stage 5 */}
                <View style={{ ...funnelStyles.stageCard, borderColor: '#10B98133' }}>
                    <View style={{ ...funnelStyles.stageNumber, backgroundColor: '#10B981' }}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>5</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={funnelStyles.stageTitle}>Acompanhamento pós-venda</Text>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#10B981' }}>O que:</Text>
                            <Text style={funnelStyles.stageText}>Suporte na documentação e transferência.</Text>
                        </View>
                        <View style={funnelStyles.stageRow}>
                            <Text style={{ ...funnelStyles.stageLabel, color: '#10B981' }}>Por que:</Text>
                            <Text style={funnelStyles.stageText}>Garantir experiência completa.</Text>
                        </View>
                        <View style={{ ...funnelStyles.impactBox, backgroundColor: '#10B98110', borderWidth: 1, borderStyle: 'solid', borderColor: '#10B98133' }}>
                            <Text style={{ fontSize: 10, color: '#10B981' }}>✓</Text>
                            <Text style={{ ...funnelStyles.impactText, color: '#10B981' }}>
                                Satisfação e futuras indicações.
                            </Text>
                        </View>
                    </View>
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
