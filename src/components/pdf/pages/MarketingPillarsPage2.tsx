import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';

interface MarketingPillarsPage2Props {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Pilares Estratégicos - Parte 2
 * 
 * Mostra os últimos 3 pilares do plano de marketing:
 * 4. Publicidade Digital Segmentada
 * 5. Redes Sociais e Engajamento
 * 6. Parcerias Estratégicas
 */
export const MarketingPillarsPage2: React.FC<MarketingPillarsPage2Props> = ({
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
        impactBox: {
            marginTop: 12,
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: 'solid',
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
                    <Text style={{ ...styles.label, color: '#FB923C', marginBottom: 4 }}>
                        FUNDAMENTOS
                    </Text>
                    <Text style={styles.h2}>Pilares Estratégicos</Text>
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

                {/* Pilar 4: Publicidade Digital Segmentada */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#FB923C20',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#FB923C' }}>04</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Publicidade Digital Segmentada</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                Campanhas estratégicas para alcançar compradores qualificados nos canais
                                mais efetivos para o perfil do imóvel.
                            </Text>

                            <View style={{ gap: 8 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#FB923C' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Google Ads e Meta Ads</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#FB923C' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Retargeting inteligente</Text>
                                </View>
                            </View>

                            <View style={{
                                ...pillarStyles.impactBox,
                                backgroundColor: '#FB923C10',
                                borderColor: '#FB923C33',
                            }}>
                                <Text style={{ ...pillarStyles.impactText, color: '#FB923C' }}>
                                    IMPACTO: Alcançar compradores certos, no momento certo, com a mensagem certa.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pilar 5: Redes Sociais e Engajamento */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#EC489820',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#EC4899' }}>05</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Redes Sociais e Engajamento</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                Presença estratégica nas principais redes sociais para ampliar
                                a visibilidade e gerar interesse orgânico.
                            </Text>

                            <View style={{ gap: 8 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#EC4899' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Instagram e Facebook</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#EC4899' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Stories e Reels</Text>
                                </View>
                            </View>

                            <View style={{
                                ...pillarStyles.impactBox,
                                backgroundColor: '#EC489810',
                                borderColor: '#EC489833',
                            }}>
                                <Text style={{ ...pillarStyles.impactText, color: '#EC4899' }}>
                                    IMPACTO: Visibilidade massiva e engajamento com potenciais compradores.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pilar 6: Parcerias Estratégicas */}
                <View style={pillarStyles.pillarCard}>
                    <View style={pillarStyles.pillarHeader}>
                        <View style={{
                            ...pillarStyles.iconContainer,
                            backgroundColor: '#14B8A620',
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, color: '#14B8A6' }}>06</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={pillarStyles.pillarTitle}>Parcerias Estratégicas</Text>

                            <Text style={pillarStyles.pillarDescription}>
                                Rede de parceiros e corretores para ampliar o alcance e acelerar
                                a comercialização do imóvel.
                            </Text>

                            <View style={{ gap: 8 }}>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#14B8A6' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Rede de corretores parceiros</Text>
                                </View>
                                <View style={pillarStyles.checkItem}>
                                    <Text style={{ fontSize: 10, color: '#14B8A6' }}>✓</Text>
                                    <Text style={pillarStyles.checkText}>Parcerias com imobiliárias</Text>
                                </View>
                            </View>

                            <View style={{
                                ...pillarStyles.impactBox,
                                backgroundColor: '#14B8A610',
                                borderColor: '#14B8A633',
                            }}>
                                <Text style={{ ...pillarStyles.impactText, color: '#14B8A6' }}>
                                    IMPACTO: Multiplicar a exposição e acelerar o processo de venda com rede de parceiros.
                                </Text>
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
                        <Text style={{ fontWeight: 600 }}>Resultado:</Text> A combinação dos 6 pilares cria
                        uma estratégia robusta para posicionar o imóvel com destaque no mercado e atrair os
                        compradores mais qualificados.
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
