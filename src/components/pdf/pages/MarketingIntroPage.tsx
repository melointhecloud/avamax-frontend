import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { BrokerData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';

interface MarketingIntroPageProps {
    styles: PdfStyleSheet;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Introdução ao Plano de Marketing
 */
export const MarketingIntroPage: React.FC<MarketingIntroPageProps> = ({
    styles,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    return (
        <Page size="A4" style={styles.page}>
            <PdfHeader
                styles={styles}
                title="Plano de Marketing"
                subtitle="Estratégia de Divulgação e Venda"
                badge="Estratégia Comercial"
                broker={broker}
                accentColor={accentColor}
            />

            <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                {/* Intro Text */}
                <Text style={{ ...styles.h3, marginBottom: 12 }}>
                    Maximizando o Valor do Seu Imóvel
                </Text>

                <View style={{ ...styles.card, marginBottom: 16 }}>
                    <Text style={{ ...styles.body, lineHeight: 1.6, marginBottom: 10 }}>
                        Um <Text style={{ fontWeight: 600 }}>plano de marketing estratégico</Text> é
                        essencial para alcançar o melhor valor de venda em um mercado competitivo. Nossa
                        abordagem combina{' '}
                        <Text style={{ fontWeight: 600 }}>técnicas digitais</Text> com{' '}
                        <Text style={{ fontWeight: 600 }}>estratégias tradicionais</Text> comprovadas para
                        maximizar a visibilidade do seu imóvel.
                    </Text>

                    <Text style={{ ...styles.body, lineHeight: 1.6 }}>
                        Este plano foi desenvolvido especificamente para o perfil do seu imóvel,
                        considerando localização, público-alvo e tendências atuais do mercado.
                    </Text>
                </View>

                {/* Key Benefits */}
                <Text style={{ ...styles.h4, fontSize: 12, marginBottom: 10 }}>
                    Por que um Plano de Marketing é Importante?
                </Text>

                <View style={{ gap: 10, marginBottom: 16 }}>
                    {/* Benefit 1 */}
                    <View style={{ ...styles.flexRow, ...styles.gap12 }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>1</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...styles.h4, fontSize: 10, marginBottom: 3 }}>
                                Maior Visibilidade
                            </Text>
                            <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.5 }}>
                                Alcança mais compradores potenciais através de múltiplos canais de divulgação.
                            </Text>
                        </View>
                    </View>

                    {/* Benefit 2 */}
                    <View style={{ ...styles.flexRow, ...styles.gap12 }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>2</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...styles.h4, fontSize: 10, marginBottom: 3 }}>
                                Venda Mais Rápida
                            </Text>
                            <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.5 }}>
                                Imóveis bem divulgados vendem até 40% mais rápido que a média do mercado.
                            </Text>
                        </View>
                    </View>

                    {/* Benefit 3 */}
                    <View style={{ ...styles.flexRow, ...styles.gap12 }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>3</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...styles.h4, fontSize: 10, marginBottom: 3 }}>
                                Melhor Precificação
                            </Text>
                            <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.5 }}>
                                Estratégias adequadas permitem negociar valores mais próximos do pedido inicial.
                            </Text>
                        </View>
                    </View>

                    {/* Benefit 4 */}
                    <View style={{ ...styles.flexRow, ...styles.gap12 }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: `${accentColor}33`,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: accentColor }}>4</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...styles.h4, fontSize: 10, marginBottom: 3 }}>
                                Profissionalismo
                            </Text>
                            <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.5 }}>
                                Apresentação profissional transmite confiança e valoriza o imóvel.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CTA Box */}
                <View
                    style={{
                        backgroundColor: `${accentColor}26`,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: `${accentColor}66`,
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <Text style={{ ...styles.h4, fontSize: 11, marginBottom: 8, color: accentColor }}>
                        Nas próximas páginas
                    </Text>
                    <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.6 }}>
                        Você encontrará detalhes sobre os{' '}
                        <Text style={{ fontWeight: 600 }}>3 pilares estratégicos</Text> do nosso plano, o{' '}
                        <Text style={{ fontWeight: 600 }}>funil de vendas</Text> otimizado e os{' '}
                        <Text style={{ fontWeight: 600 }}>benefícios exclusivos</Text> da nossa abordagem.
                    </Text>
                </View>
            </View>

            <PdfFooter styles={styles} pageNumber={pageNumber} totalPages={totalPages} />
        </Page>
    );
};
