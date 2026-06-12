/**
 * Handler para gerar PDF usando @react-pdf/renderer
 * Alternativa ao html2canvas para qualidade vetorial superior
 * ATUALIZADO: Agora converte imagens para Base64 automaticamente
 */

import { pdf } from '@react-pdf/renderer';
import { AvaluzPdfDocument } from '../AvaluzPdfDocument';
import { adaptReportDataToPdfFormat } from '../adapters/reportDataAdapter';
import { toast } from 'sonner';

export interface GenerateNewPdfOptions {
    reportData: any;
    documentTitle: string;
    accentColor?: string;
    showMarketingPlan?: boolean;
}

/**
 * Gera PDF usando @react-pdf/renderer (qualidade vetorial)
 * Converte automaticamente todas as imagens para Base64
 */
export async function generateNewPdf(options: GenerateNewPdfOptions): Promise<void> {
    const {
        reportData,
        documentTitle,
        accentColor = '#FF6B35',
        showMarketingPlan = true,
    } = options;

    try {
        toast.info('Preparando imagens para o PDF...');

        // Adaptar dados para o novo formato (converte imagens para Base64)
        const { property, market, broker, samples, clientName } = await adaptReportDataToPdfFormat(reportData);

        toast.info('Gerando PDF com qualidade vetorial...');

        // Gerar PDF usando @react-pdf/renderer
        const blob = await pdf(
            <AvaluzPdfDocument
                property={property}
                market={market}
                broker={broker}
                samples={samples}
                clientName={clientName}
                settings={{
                    showMinimo: true,
                    showMaximo: true,
                    showMarketingIntro: showMarketingPlan,
                    pdfColors: {
                        secondary: accentColor,
                    },
                }}
            />
        ).toBlob();

        console.log('✅ PDF gerado:', blob.size, 'bytes');

        // Criar URL e fazer download
        const url = URL.createObjectURL(blob);

        const sanitizeFilename = (filename: string) => {
            return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        };

        const finalFileName = `${sanitizeFilename(documentTitle || 'avaliacao_avaluz')}.pdf`;

        // Detectar iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        if (isIOS) {
            window.location.href = url;
            toast.success('PDF aberto! Toque no ícone de compartilhar para salvar.', { duration: 6000 });
            setTimeout(() => URL.revokeObjectURL(url), 3000);
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            toast.success('PDF baixado com sucesso!');
        }
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error(`Erro ao gerar PDF: ${errorMsg}`);
        throw error;
    }
}
