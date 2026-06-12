import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface RatingStarsProps {
    rating: number; // 1-5
    size?: number;
    color?: string;
    label?: string;
}

/**
 * Componente de Rating com Estrelas para PDF
 * 
 * Renderiza estrelas preenchidas e vazias baseado no rating
 * Como @react-pdf/renderer não suporta ícones SVG, usamos caracteres Unicode
 */
export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    size = 10,
    color = '#3B82F6',
    label,
}) => {
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        label: {
            fontSize: 9,
            color: '#9CA3AF',
            marginRight: 4,
        },
        starContainer: {
            flexDirection: 'row',
            gap: 2,
        },
        star: {
            fontSize: size,
            color: color,
        },
        ratingValue: {
            fontSize: 8,
            color: '#9CA3AF',
            marginLeft: 4,
        },
    });

    // Garantir que rating está entre 0 e 5
    const validRating = Math.max(0, Math.min(5, Math.round(rating)));

    // Renderizar estrelas
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Text key={i} style={styles.star}>
                {i <= validRating ? '★' : '☆'}
            </Text>
        );
    }

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}:</Text>}
            <View style={styles.starContainer}>
                {stars}
            </View>
            <Text style={styles.ratingValue}>({validRating}/5)</Text>
        </View>
    );
};
