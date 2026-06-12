import { getImageUrlForPdf } from '@/lib/pdf';
import type { SimilarProperty } from './types';

export const REMAX_SAMPLES_PER_TABLE_PAGE = 6;
export const REMAX_MAX_SAMPLE_PAGES = 6;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const formatPricePerM2 = (value: number, area: number) =>
  area > 0
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(value / area)
    : '-';

export const getSampleDisplayTitle = (sample: SimilarProperty) =>
  sample.categoria || sample.titulo || 'Imóvel';

export const getSampleLocation = (sample: SimilarProperty) =>
  [sample.rua, sample.bairro, sample.municipio, sample.estado].filter(Boolean).join(' • ');

export const getSampleLocationStructured = (sample: SimilarProperty) => {
  const hasRua = !!sample.rua;
  const line1 = hasRua ? sample.rua! : sample.bairro || '';
  const parts: string[] = [];
  if (hasRua && sample.bairro) parts.push(sample.bairro);
  if (sample.municipio) parts.push(sample.municipio);
  const line2 = sample.estado
    ? [...parts, sample.estado].join(parts.length ? ', ' : '').replace(/, ([^,]+)$/, ' - $1')
    : parts.join(', ');
  return { line1, line2 };
};

export const getSampleImages = (sample: SimilarProperty) => {
  const images = [sample.imagem, ...(sample.imagens || [])].filter(Boolean) as string[];
  return images.slice(0, 4).map((image) => getImageUrlForPdf(image));
};

export const chunkSamples = <T,>(samples: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < samples.length; index += size) {
    chunks.push(samples.slice(index, index + size));
  }

  return chunks;
};
