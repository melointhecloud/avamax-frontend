import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// Estilos minimalistas
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#0A1E3C',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    text: {
        fontSize: 12,
        color: '#CCCCCC',
        lineHeight: 1.5,
    },
    card: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
});

/**
 * Versão minimalista do PDF para teste
 */
export const MinimalPdfDocument = () => {
    return (
        <Document title="Teste Mínimo">
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Avaliação Imobiliária</Text>

                <View style={styles.card}>
                    <Text style={styles.text}>
                        Este é um teste minimalista para validar a compatibilidade com React 19.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.text}>
                        Se este PDF foi gerado com sucesso, a infraestrutura básica está funcionando.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.text}>
                        Próximo passo: adicionar componentes mais complexos incrementalmente.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
