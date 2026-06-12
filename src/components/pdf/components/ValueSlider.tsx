import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface ValueSliderProps {
    minValue: number;
    maxValue: number;
    currentValue: number;
    estimatedValue?: number;
    color?: string;
    label?: string;
}

/**
 * Componente de Slider de Valor para PDF
 * 
 * Mostra visualmente a posição de um valor em uma faixa (mín-máx)
 */
export const ValueSlider: React.FC<ValueSliderProps> = ({
    minValue,
    maxValue,
    currentValue,
    estimatedValue,
    color = '#3B82F6',
    label,
}) => {
    // Calcular posição percentual do valor atual
    const range = maxValue - minValue;
    const currentPosition = range > 0 ? ((currentValue - minValue) / range) * 100 : 50;
    const estimatedPosition = estimatedValue && range > 0
        ? ((estimatedValue - minValue) / range) * 100
        : null;

    // Clampar entre 0 e 100
    const clampPosition = (pos: number) => Math.max(0, Math.min(100, pos));

    const formatMoney = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 12,
        },
        label: {
            fontSize: 9,
            color: '#9CA3AF',
            marginBottom: 8,
        },
        sliderContainer: {
            height: 32,
            position: 'relative',
        },
        sliderTrack: {
            position: 'absolute',
            top: 12,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#374151',
            borderRadius: 4,
        },
        sliderFill: {
            position: 'absolute',
            top: 12,
            left: 0,
            height: 8,
            backgroundColor: `${color}66`,
            borderRadius: 4,
        },
        markerContainer: {
            position: 'absolute',
            top: 0,
            width: 24,
            height: 24,
            marginLeft: -12, // Center the marker
        },
        marker: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: '#FFFFFF',
        },
        markerText: {
            fontSize: 6,
            color: '#FFFFFF',
            fontWeight: 700,
        },
        estimatedMarker: {
            position: 'absolute',
            top: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#10B981',
            marginLeft: -4,
        },
        valuesRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
        },
        valueLabel: {
            fontSize: 8,
            color: '#9CA3AF',
        },
        currentValueLabel: {
            fontSize: 8,
            fontWeight: 700,
            color: color,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.sliderContainer}>
                {/* Track background */}
                <View style={styles.sliderTrack} />

                {/* Fill up to current value */}
                <View
                    style={{
                        ...styles.sliderFill,
                        width: `${clampPosition(currentPosition)}%`,
                    }}
                />

                {/* Estimated value marker (if different from current) */}
                {estimatedPosition !== null && (
                    <View
                        style={{
                            ...styles.estimatedMarker,
                            left: `${clampPosition(estimatedPosition)}%`,
                        }}
                    />
                )}

                {/* Current value marker */}
                <View
                    style={{
                        ...styles.markerContainer,
                        left: `${clampPosition(currentPosition)}%`,
                    }}
                >
                    <View style={styles.marker}>
                        <Text style={styles.markerText}>V</Text>
                    </View>
                </View>
            </View>

            {/* Min/Max labels */}
            <View style={styles.valuesRow}>
                <Text style={styles.valueLabel}>{formatMoney(minValue)}</Text>
                <Text style={styles.currentValueLabel}>{formatMoney(currentValue)}</Text>
                <Text style={styles.valueLabel}>{formatMoney(maxValue)}</Text>
            </View>
        </View>
    );
};
