/**
 * Índice de exports para o sistema de PDF Nativo
 */

// Tokens e configurações
export * from './tokens';
export * from './types';
export * from './styles';

// Utilitários de imagem (manter do sistema antigo)
export { 
  normalizeImageUrl, 
  extractMultipleImageUrls, 
  getProxiedImageUrl,
  getImageUrlForPdf,
  getMultipleImagesForPdf,
} from './pdfImages';
