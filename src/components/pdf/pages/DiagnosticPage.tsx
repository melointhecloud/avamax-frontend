import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { PropertyData, MarketData, BrokerData } from '../types';
import { formatMoney, formatPercentage } from '../utils';

interface DiagnosticPageProps {
    styles: PdfStyleSheet;
    property: PropertyData;
    market: MarketData;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Diagnóstico de Mercado
 * 
 * Mostra análise comparativa do valor estimado vs valor pedido,
 * faixa de valores e posicionamento no mercado
 */
export const DiagnosticPage: React.FC<DiagnosticPageProps> = ({
    styles,
    property,
    market,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    // Calcular diferença e percentual
    const valorPedido = property.valor_atual || market.valor_estimado;
    const diferenca = valorPedido - market.valor_estimado;
    const percentual = market.valor_estimado > 0 ? (diferenca / market.valor_estimado) * 100 : 0;

    // Determinar se está acima ou abaixo do mercado
    const acimaMercado = diferenca > 0;
    const dentroDaMargem = Math.abs(percentual) <= 5; // dentro de ±5% é considerado dentro da margem

    // Calcular posição no slider (0-100%)
    const range = market.maximo - market.minimo;
    const sliderPosition = range > 0
        ? Math.max(0, Math.min(100, ((market.valor_estimado - market.minimo) / range) * 100))
        : 50;

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={{ ...styles.label, color: accentColor, marginBottom: 4 }}>
                        DIAGNÓSTICO DE MERCADO
                    </Text>
                    <Text style={styles.h2}>Análise Comparativa de Valor</Text>
                </View>
                <View style={{ ...styles.flexRow, ...styles.gap8 }}>
                    {broker?.logo_imobiliaria_url && (
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            borderColor: `${accentColor}66`,
                            overflow: 'hidden'
                        }} />
                    )}
                </View>
            </View>

            {/* Content */}
            <View style={{ padding: 32, flex: 1 }}>

                {/* Valor Estimado - Destaque */}
                <View style={{
                    ...styles.cardAccent,
                    backgroundColor: `${accentColor}1a`,
                    borderColor: `${accentColor}66`,
                    marginBottom: 24,
                    padding: 24
                }}>
                    <Text style={{ ...styles.label, color: accentColor, marginBottom: 8 }}>
                        Valor Estimado de Mercado
                    </Text>
                    <Text style={{ ...styles.h1, fontSize: 42, color: accentColor, marginBottom: 8 }}>
                        {formatMoney(market.valor_estimado)}
                    </Text>
                    <Text style={{ ...styles.body, fontSize: 11 }}>
                        Baseado em {market.amostras} imóveis comparáveis • Confiança: {market.confianca}
                    </Text>
                </View>

                {/* Comparativo: Valor Pedido vs Mercado */}
                {property.valor_atual && property.valor_atual !== market.valor_estimado && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ ...styles.h3, marginBottom: 16 }}>
                            Posicionamento Atual
                        </Text>

                        <View style={{ ...styles.flexRow, ...styles.gap16, marginBottom: 16 }}>
                            {/* Valor Pedido */}
                            <View style={{ ...styles.card, flex: 1 }}>
                                <Text style={{ ...styles.label, marginBottom: 6 }}>Valor Pedido</Text>
                                <Text style={{ ...styles.h3, fontSize: 20 }}>
                                    {formatMoney(valorPedido)}
                                </Text>
                            </View>

                            {/* Diferença */}
                            <View style={{
                                ...styles.card,
                                flex: 1,
                                backgroundColor: acimaMercado ? '#EF444410' : '#10B98110',
                                borderColor: acimaMercado ? '#EF444466' : '#10B98166'
                            }}>
                                <Text style={{
                                    ...styles.label,
                                    marginBottom: 6,
                                    color: acimaMercado ? '#EF4444' : '#10B981'
                                }}>
                                    {acimaMercado ? 'Acima do Mercado' : 'Abaixo do Mercado'}
                                </Text>
                                <Text style={{
                                    ...styles.h3,
                                    fontSize: 20,
                                    color: acimaMercado ? '#EF4444' : '#10B981'
                                }}>
                                    {acimaMercado ? '+' : ''}{formatPercentage(percentual)}
                                </Text>
                            </View>
                        </View>

                        {/* Recomendação */}
                        <View style={{
                            padding: 16,
                            backgroundColor: dentroDaMargem ? '#10B98110' : '#F59E0B10',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: dentroDaMargem ? '#10B98133' : '#F59E0B33'
                        }}>
                            <Text style={{ ...styles.h4, marginBottom: 6, fontSize: 11 }}>
                                {dentroDaMargem ? '✓ Dentro da Faixa Ideal' : '⚠ Atenção ao Posicionamento'}
                            </Text>
                            <Text style={{ ...styles.bodySmall, fontSize: 9, lineHeight: 1.4 }}>
                                {dentroDaMargem
                                    ? 'O valor pedido está alinhado com o mercado, favorecendo uma venda mais rápida e pelo melhor preço.'
                                    : acimaMercado
                                        ? 'Valor acima do mercado pode resultar em tempo de venda maior. Considere ajuste para competitividade.'
                                        : 'Valor abaixo do mercado pode indicar oportunidade de reavaliação para maximizar retorno.'
                                }
                            </Text>
                        </View>
                    </View>
                )}

                {/* Faixa de Valores */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ ...styles.h3, marginBottom: 16 }}>Faixa de Mercado</Text>

                    <View style={{ ...styles.flexRow, ...styles.gap12, marginBottom: 16 }}>
                        <View style={{ ...styles.card, flex: 1 }}>
                            <Text style={{ ...styles.label, marginBottom: 4, fontSize: 8 }}>
                                Mínimo
                            </Text>
                            <Text style={{ ...styles.h4, fontSize: 14 }}>
                                {formatMoney(market.minimo)}
                            </Text>
                        </View>

                        <View style={{
                            ...styles.card,
                            flex: 1.2,
                            backgroundColor: `${accentColor}1a`,
                            borderColor: `${accentColor}66`
                        }}>
                            <Text style={{
                                ...styles.label,
                                marginBottom: 4,
                                fontSize: 8,
                                color: accentColor
                            }}>
                                Estimado
                            </Text>
                            <Text style={{ ...styles.h4, fontSize: 14, color: accentColor }}>
                                {formatMoney(market.valor_estimado)}
                            </Text>
                        </View>

                        <View style={{ ...styles.card, flex: 1 }}>
                            <Text style={{ ...styles.label, marginBottom: 4, fontSize: 8 }}>
                                Máximo
                            </Text>
                            <Text style={{ ...styles.h4, fontSize: 14 }}>
                                {formatMoney(market.maximo)}
                            </Text>
                        </View>
                    </View>

                    {/* Representação Visual da Faixa */}
                    <View style={{ position: 'relative', marginTop: 8 }}>
                        {/* Base do slider */}
                        <View style={{
                            height: 8,
                            backgroundColor: '#E5E7EB',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Parte preenchida até o valor estimado */}
                            <View style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${sliderPosition}%`,
                                backgroundColor: accentColor,
                                borderRadius: 4
                            }} />
                        </View>

                        {/* Indicador do valor estimado */}
                        <View style={{
                            position: 'absolute',
                            left: `${sliderPosition}%`,
                            top: -6,
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: accentColor,
                            borderWidth: 3,
                            borderStyle: 'solid',
                            borderColor: 'white'
                        }} />
                    </View>
                </View>

                {/* Nota de Metodologia */}
                <View style={{
                    marginTop: 'auto',
                    padding: 16,
                    backgroundColor: '#F3F4F610',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: '#E5E7EB33'
                }}>
                    <Text style={{ ...styles.bodySmall, fontSize: 8, lineHeight: 1.5 }}>
                        <Text style={{ fontWeight: 600 }}>Metodologia:</Text> Os valores são calculados através do
                        Método Comparativo Direto, analisando imóveis similares em localização, tipologia e características.
                        A faixa de valores reflete a variação natural do mercado local.
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Avaluz • Diagnóstico de Mercado</Text>
                <Text style={styles.footerText}>
                    {String(pageNumber).padStart(2, '0')} / {totalPages}
                </Text>
            </View>
        </Page>
    );
};
