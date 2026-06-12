import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { PdfStyleSheet } from '../styles/pdfStyles';

interface PdfFooterProps {
    styles: PdfStyleSheet;
    leftText?: string;
    pageNumber: number;
    totalPages: number;
}

/**
 * Componente de Footer reutilizável para páginas do PDF
 */
export const PdfFooter: React.FC<PdfFooterProps> = ({
    styles,
    leftText = 'Avaluz • Estudo de Mercado',
    pageNumber,
    totalPages,
}) => {
    const formattedPageNumber = String(pageNumber).padStart(2, '0');
    const formattedTotalPages = String(totalPages).padStart(2, '0');

    return (
        <View style={styles.footer}>
            <Text style={{ ...styles.bodySmall, opacity: 0.4 }}>{leftText}</Text>
            <Text style={{ ...styles.bodySmall, opacity: 0.4 }}>
                {formattedPageNumber} / {formattedTotalPages}
            </Text>
        </View>
    );
};
