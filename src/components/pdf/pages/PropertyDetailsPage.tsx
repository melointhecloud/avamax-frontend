import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';
import { PropertyData } from '../types';
import { PdfHeader } from '../components/PdfHeader';
import { PdfFooter } from '../components/PdfFooter';
import { BrokerData } from '../types';
import { formatMoney, getMobiliadoLabel } from '../utils';
import { RatingStars } from '../components/RatingStars';

interface PropertyDetailsPageProps {
    styles: PdfStyleSheet;
    property: PropertyData;
    broker?: BrokerData;
    totalPages: number;
    pageNumber: number;
    accentColor: string;
}

/**
 * Página de Detalhes do Imóvel
 */
export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
    styles,
    property,
    broker,
    totalPages,
    pageNumber,
    accentColor,
}) => {
    const mobiliadoLabel = getMobiliadoLabel(property.mobiliado);

    return (
        <Page size="A4" style={styles.page}>
            <PdfHeader
                styles={styles}
                title="Identificação do Imóvel"
                badge="Especificações Técnicas"
                broker={broker}
                accentColor={accentColor}
            />

            <View style={{ ...styles.content, position: 'relative', zIndex: 10 }}>
                {/* Property Image */}
                {property.foto_capa && (
                    <View style={{ marginBottom: 20 }}>
                        <Image
                            src={property.foto_capa}
                            style={{
                                width: '100%',
                                height: 220,
                                objectFit: 'cover',
                                borderRadius: 12,
                            }}
                        />
                    </View>
                )}

                {/* Main Info Grid */}
                <View style={{ ...styles.flexRow, ...styles.gap16, marginBottom: 20 }}>
                    {/* Left Column - Location & Type */}
                    <View style={{ flex: 1 }}>
                        {/* Location */}
                        <View style={{ ...styles.card, marginBottom: 12 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Localização</Text>
                            {property.rua && (
                                <Text style={{ ...styles.body, fontSize: 9, marginBottom: 2 }}>
                                    {property.rua}
                                </Text>
                            )}
                            <Text style={{ ...styles.h4, fontSize: 11 }}>{property.bairro}</Text>
                            <Text style={styles.bodySmall}>
                                {property.municipio} - {property.estado}
                            </Text>
                            {property.cep && (
                                <Text style={{ ...styles.bodySmall, marginTop: 4 }}>
                                    CEP: {property.cep}
                                </Text>
                            )}
                        </View>

                        {/* Type */}
                        <View style={styles.card}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Tipo de Imóvel</Text>
                            <Text style={{ ...styles.h4, fontSize: 11 }}>{property.tipo}</Text>
                        </View>
                    </View>

                    {/* Right Column - Specs */}
                    <View style={{ flex: 1 }}>
                        <View style={styles.card}>
                            <Text style={{ ...styles.label, marginBottom: 8 }}>
                                Especificações
                            </Text>

                            {/* Specs Grid */}
                            <View style={{ gap: 8 }}>
                                {/* Area */}
                                <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                    <Text style={{ ...styles.body, fontSize: 9 }}>Área Total</Text>
                                    <Text style={{ ...styles.body, fontSize: 9, fontWeight: 600 }}>
                                        {property.area}m²
                                    </Text>
                                </View>

                                {/* Quartos */}
                                <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                    <Text style={{ ...styles.body, fontSize: 9 }}>Quartos</Text>
                                    <Text style={{ ...styles.body, fontSize: 9, fontWeight: 600 }}>
                                        {property.quartos}
                                    </Text>
                                </View>

                                {/* Suites */}
                                {property.suites > 0 && (
                                    <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                        <Text style={{ ...styles.body, fontSize: 9 }}>Suítes</Text>
                                        <Text style={{ ...styles.body, fontSize: 9, fontWeight: 600 }}>
                                            {property.suites}
                                        </Text>
                                    </View>
                                )}

                                {/* Banheiros */}
                                <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                    <Text style={{ ...styles.body, fontSize: 9 }}>Banheiros</Text>
                                    <Text style={{ ...styles.body, fontSize: 9, fontWeight: 600 }}>
                                        {property.banheiros}
                                    </Text>
                                </View>

                                {/* Vagas */}
                                <View style={{ ...styles.flexRow, ...styles.spaceBetween }}>
                                    <Text style={{ ...styles.body, fontSize: 9 }}>Vagas de Garagem</Text>
                                    <Text style={{ ...styles.body, fontSize: 9, fontWeight: 600 }}>
                                        {property.vagas}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Financial Info */}
                <View style={{ ...styles.flexRow, ...styles.gap12, marginBottom: 20 }}>
                    {/* Current Value */}
                    {property.valor_atual && (
                        <View style={{ ...styles.card, flex: 1 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Valor do Imóvel</Text>
                            <Text style={{ ...styles.h4, fontSize: 12, color: accentColor }}>
                                {formatMoney(property.valor_atual)}
                            </Text>
                        </View>
                    )}

                    {/* Condominium */}
                    {property.condominio && (
                        <View style={{ ...styles.card, flex: 1 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Condomínio</Text>
                            <Text style={{ ...styles.body, fontSize: 10, fontWeight: 600 }}>
                                {formatMoney(property.condominio)}
                            </Text>
                        </View>
                    )}

                    {/* IPTU */}
                    {property.iptu && (
                        <View style={{ ...styles.card, flex: 1 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>IPTU</Text>
                            <Text style={{ ...styles.body, fontSize: 10, fontWeight: 600 }}>
                                {formatMoney(property.iptu)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Ratings/Avaliações */}
                {(property.avaliacaoTecnica || property.localizacao || property.planta ||
                    property.acabamentos || property.conservacao || property.areasComuns) && (
                        <View style={{ ...styles.card, marginBottom: 20 }}>
                            <Text style={{ ...styles.label, marginBottom: 12 }}>
                                Avaliação do Corretor
                            </Text>

                            <View style={{ gap: 8 }}>
                                {property.avaliacaoTecnica && (
                                    <RatingStars
                                        rating={property.avaliacaoTecnica}
                                        label="Avaliação Técnica"
                                        color={accentColor}
                                    />
                                )}
                                {property.localizacao && (
                                    <RatingStars
                                        rating={property.localizacao}
                                        label="Localização"
                                        color={accentColor}
                                    />
                                )}
                                {property.planta && (
                                    <RatingStars
                                        rating={property.planta}
                                        label="Planta/Layout"
                                        color={accentColor}
                                    />
                                )}
                                {property.acabamentos && (
                                    <RatingStars
                                        rating={property.acabamentos}
                                        label="Acabamentos"
                                        color={accentColor}
                                    />
                                )}
                                {property.conservacao && (
                                    <RatingStars
                                        rating={property.conservacao}
                                        label="Conservação"
                                        color={accentColor}
                                    />
                                )}
                                {property.areasComuns && (
                                    <RatingStars
                                        rating={property.areasComuns}
                                        label="Áreas Comuns"
                                        color={accentColor}
                                    />
                                )}
                            </View>
                        </View>
                    )}

                {/* Additional Info */}
                {(mobiliadoLabel || property.features?.length > 0) && (
                    <View style={{ ...styles.card, marginBottom: 16 }}>
                        <Text style={{ ...styles.label, marginBottom: 8 }}>
                            Características Adicionais
                        </Text>

                        {mobiliadoLabel && (
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ ...styles.body, fontSize: 9 }}>
                                    • {mobiliadoLabel}
                                </Text>
                            </View>
                        )}

                        {property.features?.slice(0, 8).map((feature, idx) => (
                            <View key={idx} style={{ marginBottom: 4 }}>
                                <Text style={{ ...styles.body, fontSize: 9 }}>• {feature}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Description */}
                {property.descricao && (
                    <View style={styles.card}>
                        <Text style={{ ...styles.label, marginBottom: 6 }}>Descrição</Text>
                        <Text style={{ ...styles.body, fontSize: 9, lineHeight: 1.5 }}>
                            {property.descricao}
                        </Text>
                    </View>
                )}
            </View>

            <PdfFooter styles={styles} pageNumber={pageNumber} totalPages={totalPages} />
        </Page>
    );
};
