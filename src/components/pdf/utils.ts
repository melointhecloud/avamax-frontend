// Funções utilitárias para PDFs

/**
 * Formata valor monetário
 */
export const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Formata preço por m²
 */
export const formatPricePerM2 = (totalValue: number, area: number): string => {
    if (area <= 0) return 'R$ 0';
    const pricePerM2 = totalValue / area;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(pricePerM2);
};

/**
 * Formata percentual
 */
export const formatPercentage = (value: number): string => {
    const roundedValue = Math.round(value * 10) / 10; // Arredonda para 1 casa decimal
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(roundedValue / 100); // Divide por 100 porque o valor já vem em percentual
};

/**
 * Obtém label de mobiliado
 */
export const getMobiliadoLabel = (mobiliado?: string): string | null => {
    if (!mobiliado) return null;

    const labels: Record<string, string> = {
        completo: 'Totalmente Mobiliado',
        parcial: 'Parcialmente Mobiliado',
        nao: 'Não Mobiliado',
    };

    return labels[mobiliado] || mobiliado;
};

/**
 * Obtém labels de situação legal
 */
export const getSituacaoLegalLabels = (situacaoLegal?: string): string | null => {
    if (!situacaoLegal) return null;

    const labels: Record<string, string> = {
        regularizado: 'Regularizado',
        escriturado: 'Escriturado',
        matricula: 'Com Matrícula',
        documentacao_ok: 'Documentação OK',
    };

    return labels[situacaoLegal] || situacaoLegal;
};

/**
 * Converte URL de imagem para base64 (necessário para algumas imagens em PDFs)
 * Nota: Esta função é assíncrona e deve ser usada com cuidado
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return url; // Fallback para URL original
    }
};

/**
 * Processa URL de imagem para PDF
 * @react-pdf/renderer funciona melhor com URLs diretas de imagens
 */
export const getImageUrlForPdf = (url?: string): string => {
    if (!url) return '';

    // Se já é base64, retornar direto
    if (url.startsWith('data:')) return url;

    // Se é URL válida, retornar
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Se é caminho relativo, tentar construir URL absoluta
    // (ajustar conforme necessário para seu ambiente)
    return url;
};

/**
 * Divide array em chunks (útil para paginação)
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Calcula número de páginas baseado em conteúdo dinâmico
 */
export const calculateTotalPages = (
    detailedSamplesCount: number,
    totalSamplesCount: number,
    hasMarketingPlan: boolean
): number => {
    let pages = 4; // Cover + Methodology + Property Details + Diagnostic

    if (hasMarketingPlan) {
        pages += 5; // Intro + Pillars (2) + Funnel + Benefits
    }

    pages += detailedSamplesCount; // 1 página por amostra detalhada
    pages += Math.ceil(totalSamplesCount / 6); // Comparative table (6 amostras por página)
    pages += 1; // Conclusion

    return pages;
};
