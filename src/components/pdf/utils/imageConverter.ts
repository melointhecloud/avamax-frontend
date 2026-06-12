/**
 * Utilitário para converter imagens para Base64
 * Resolve o problema de imagens externas causando erro DataView no @react-pdf/renderer
 */

const FALLBACK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO88B8AAqUB0Y/ERyQAAAAASUVORK5CYII="; // 1x1 gray png

/**
 * Converte uma URL de imagem para Base64
 * @param url - URL da imagem (pode ser externa ou local)
 * @param maxSizeKB - Tamanho máximo em KB (default: 500KB)
 * @returns Base64 string ou FALLBACK_IMAGE se falhar
 */
export async function convertImageToBase64(
    url: string,
    maxSizeKB: number = 500
): Promise<string | null> {
    try {
        // Se já é base64, retorna direto
        if (url.startsWith('data:')) {
            return url;
        }

        // Fetch da imagem
        const response = await fetch(url, {
            mode: 'cors',
            cache: 'force-cache', // Usar cache quando possível
        });

        if (!response.ok) {
            console.warn(`Falha ao carregar imagem: ${url} (${response.status})`);
            return FALLBACK_IMAGE;
        }

        const blob = await response.blob();

        // Verificar tamanho
        const sizeKB = blob.size / 1024;
        if (sizeKB > maxSizeKB) {
            console.warn(`Imagem muito grande: ${sizeKB.toFixed(2)}KB (max: ${maxSizeKB}KB)`);
            // Continuar mesmo assim, mas avisar
        }

        // Converter para Base64
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result);
            };

            reader.onerror = () => {
                console.error('Erro ao ler imagem como Base64');
                resolve(FALLBACK_IMAGE);
            };

            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao converter imagem para Base64:', error);
        return FALLBACK_IMAGE;
    }
}

/**
 * Converte múltiplas imagens para Base64 em paralelo
 * @param urls - Array de URLs de imagens
 * @param maxSizeKB - Tamanho máximo por imagem em KB
 * @returns Array de Base64 strings (null para imagens que falharam)
 */
export async function convertImagesToBase64(
    urls: (string | undefined | null)[],
    maxSizeKB: number = 500
): Promise<(string | null)[]> {
    const validUrls = urls.filter((url): url is string => !!url);

    const promises = validUrls.map(url =>
        convertImageToBase64(url, maxSizeKB)
    );

    try {
        const results = await Promise.allSettled(promises);

        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value || FALLBACK_IMAGE;
            } else {
                console.warn(`Falha ao converter imagem ${index + 1}:`, result.reason);
                return FALLBACK_IMAGE;
            }
        });
    } catch (error) {
        console.error('Erro ao converter múltiplas imagens:', error);
        return validUrls.map(() => FALLBACK_IMAGE);
    }
}

/**
 * Converte File object para Base64
 * Útil para imagens carregadas pelo usuário
 */
export async function convertFileToBase64(file: File): Promise<string | null> {
    try {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                resolve(reader.result as string);
            };

            reader.onerror = () => {
                reject(null);
            };

            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Erro ao converter File para Base64:', error);
        return null;
    }
}

/**
 * Redimensiona uma imagem para otimizar tamanho
 * @param base64 - Imagem em Base64
 * @param maxWidth - Largura máxima (default: 1200px)
 * @param quality - Qualidade JPEG 0-1 (default: 0.8)
 * @returns Base64 redimensionado
 */
export async function resizeBase64Image(
    base64: string,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Redimensionar se necessário
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject('Erro ao criar contexto canvas');
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Converter para JPEG com qualidade especificada
            const resized = canvas.toDataURL('image/jpeg', quality);
            resolve(resized);
        };

        img.onerror = () => {
            reject('Erro ao carregar imagem para redimensionar');
        };

        img.src = base64;
    });
}

/**
 * Otimiza imagem para PDF (converte + redimensiona)
 * @param url - URL da imagem
 * @param maxWidth - Largura máxima
 * @param quality - Qualidade JPEG
 * @returns Base64 otimizado ou null
 */
export async function optimizeImageForPdf(
    url: string,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<string | null> {
    try {
        const base64 = await convertImageToBase64(url);
        if (!base64) return null;

        // Se a imagem já é pequena, retorna direto
        if (base64.length < 100000) { // ~75KB
            return base64;
        }

        // Redimensionar para otimizar
        const optimized = await resizeBase64Image(base64, maxWidth, quality);
        return optimized;
    } catch (error) {
        console.error('Erro ao otimizar imagem:', error);
        return null;
    }
}
