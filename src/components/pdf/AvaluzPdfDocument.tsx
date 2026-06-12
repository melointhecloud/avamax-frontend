import React from 'react';
import { Document } from '@react-pdf/renderer';
import { createPdfStyles, PdfColors, defaultColors } from './styles/pdfStyles';
import { AvaluzPdfProps } from './types';
import { CoverPage } from './pages/CoverPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { MarketingIntroPage } from './pages/MarketingIntroPage';
import { MarketingPillarsPage1 } from './pages/MarketingPillarsPage1';
import { MarketingPillarsPage2 } from './pages/MarketingPillarsPage2';
import { MarketingFunnelPage } from './pages/MarketingFunnelPage';
import { MarketingBenefitsPage } from './pages/MarketingBenefitsPage';
import { SamplePage } from './pages/SamplePage';
import { ComparativeTablePage } from './pages/ComparativeTablePage';
import { ConclusionPage } from './pages/ConclusionPage';
import { calculateTotalPages } from './utils';

/**
 * Documento PDF principal da Avaluz
 * 
 * Este componente encapsula todas as páginas do relatório de avaliação imobiliária.
 * Utiliza @react-pdf/renderer para gerar PDFs de alta qualidade.
 */
export const AvaluzPdfDocument: React.FC<AvaluzPdfProps> = ({
    clientName,
    client,
    property,
    market,
    broker,
    samples,
    settings = {},
}) => {
    // Merge user colors with defaults
    const colors: PdfColors = {
        ...defaultColors,
        ...settings.pdfColors,
    };

    // Create styles with custom colors
    const styles = createPdfStyles(colors);
    const accentColor = colors.secondary;

    // Determine if marketing plan is enabled
    const hasMarketingPlan = settings.showMarketingIntro || false;

    // Limit detailed sample pages to 6 (like Preview), but keep all for table
    const detailedSamples = samples.slice(0, 6);

    // Calculate total pages (detailed samples limited to 6, table uses all)
    const totalPages = calculateTotalPages(detailedSamples.length, samples.length, hasMarketingPlan);

    return (
        <Document
            title={`Avaliação Imobiliária - ${property.bairro}, ${property.municipio}`}
            author={broker?.nome || broker?.imobiliaria || 'Avaluz'}
            subject="Estudo de Mercado Imobiliário"
            keywords="avaliação, imóvel, mercado, análise"
            creator="Avaluz Platform"
        >
            {/* Página 1: Capa */}
            <CoverPage
                styles={styles}
                property={property}
                market={market}
                broker={broker}
                client={client}
                clientName={clientName}
                accentColor={accentColor}
            />

            {/* Página 2: Metodologia */}
            <MethodologyPage
                styles={styles}
                broker={broker}
                totalPages={totalPages}
                accentColor={accentColor}
            />

            {/* Página 3: Detalhes do Imóvel */}
            <PropertyDetailsPage
                styles={styles}
                property={property}
                broker={broker}
                totalPages={totalPages}
                pageNumber={3}
                accentColor={accentColor}
            />

            {/* Página 4: Diagnóstico de Mercado */}
            <DiagnosticPage
                styles={styles}
                property={property}
                market={market}
                broker={broker}
                totalPages={totalPages}
                pageNumber={4}
                accentColor={accentColor}
            />

            {/* Marketing Plan (opcional) */}
            {hasMarketingPlan && (
                <>
                    <MarketingIntroPage
                        styles={styles}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={5}
                        accentColor={accentColor}
                    />
                    <MarketingPillarsPage1
                        styles={styles}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={6}
                        accentColor={accentColor}
                    />
                    <MarketingPillarsPage2
                        styles={styles}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={7}
                        accentColor={accentColor}
                    />
                    <MarketingFunnelPage
                        styles={styles}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={8}
                        accentColor={accentColor}
                    />
                    <MarketingBenefitsPage
                        styles={styles}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={9}
                        accentColor={accentColor}
                    />
                </>
            )}

            {/* Sample Pages (Limited to 6) */}
            {detailedSamples.map((sample, index) => {
                const pageNum = hasMarketingPlan ? 10 + index : 5 + index;
                return (
                    <SamplePage
                        key={sample.id}
                        styles={styles}
                        sample={sample}
                        sampleNumber={index + 1}
                        broker={broker}
                        totalPages={totalPages}
                        pageNumber={pageNum}
                        accentColor={accentColor}
                    />
                );
            })}

            {/* Comparative Table (Shows ALL samples) */}
            <ComparativeTablePage
                styles={styles}
                property={property}
                samples={samples}
                broker={broker}
                totalPages={totalPages}
                pageNumber={hasMarketingPlan ? 10 + detailedSamples.length : 5 + detailedSamples.length}
                accentColor={accentColor}
                marketAverage={market.medio}
            />

            {/* Última Página: Conclusão */}
            <ConclusionPage
                styles={styles}
                property={property}
                market={market}
                broker={broker}
                totalPages={totalPages}
                pageNumber={totalPages}
                accentColor={accentColor}
            />
        </Document>
    );
};
