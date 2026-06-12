/**
 * Utilitários para processamento de imagens em PDFs
 * Centraliza a lógica de proxy e normalização de URLs
 */

const SUPABASE_URL = 'https://jdvikyeethbirrdcawbs.supabase.co'

/**
 * URL do placeholder padrão para imóveis sem foto de capa
 */
export const PROPERTY_PLACEHOLDER_URL = '/src/assets/property-placeholder.jpg'

/**
 * Parseia uma string de array Python/JSON para array de strings
 */
const parseImageArray = (urlStr: string): string[] => {
  if (!urlStr.startsWith('[')) return []
  
  try {
    const jsonString = urlStr
      .replace(/'/g, '"')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null')
    const images = JSON.parse(jsonString)
    return Array.isArray(images) ? images.filter((img): img is string => typeof img === 'string' && img.length > 0) : []
  } catch (e) {
    console.warn('[pdfImages] Erro ao parsear array de imagens:', e)
    return []
  }
}

/**
 * Normaliza uma URL de imagem (trata formatos variados de Midia_Imovel)
 * Retorna apenas a primeira imagem
 */
export const normalizeImageUrl = (url: unknown): string => {
  if (!url) return ''
  
  const urlStr = String(url).trim()
  
  // Se já é um array, pegar primeiro elemento
  if (Array.isArray(url)) {
    return url[0] ? normalizeImageUrl(url[0]) : ''
  }
  
  // String que parece array (formato Python com aspas simples ou JSON)
  if (urlStr.startsWith('[')) {
    const images = parseImageArray(urlStr)
    return images[0] || ''
  }
  
  // URL relativa sem protocolo
  if (urlStr.startsWith('//')) {
    return `https:${urlStr}`
  }
  
  // URL direta ou qualquer outra string
  return urlStr
}

/**
 * Extrai múltiplas URLs de imagem (até o limite especificado)
 * Retorna array de URLs normalizadas
 */
export const extractMultipleImageUrls = (url: unknown, maxImages: number = 4): string[] => {
  if (!url) return []
  
  const urlStr = String(url).trim()

  let raw: string[] = []
  
  // Se já é um array
  if (Array.isArray(url)) {
    raw = url
      .slice(0, maxImages * 2)
      .map(u => normalizeImageUrl(u))
      .filter(u => u.length > 0)
  }
  // String que parece array (formato Python com aspas simples ou JSON)
  else if (urlStr.startsWith('[')) {
    const images = parseImageArray(urlStr)
    raw = images.slice(0, maxImages * 2).map(img => {
      if (img.startsWith('//')) return `https:${img}`
      return img
    })
  }
  else {
    // URL única
    const normalized = normalizeImageUrl(url)
    raw = normalized ? [normalized] : []
  }

  // Deduplica: remove URLs idênticas mantendo a ordem
  const seen = new Set<string>()
  const unique: string[] = []
  for (const u of raw) {
    if (!seen.has(u)) {
      seen.add(u)
      unique.push(u)
    }
    if (unique.length >= maxImages) break
  }

  return unique
}

/**
 * Converte URL de imagem externa para usar o proxy (resolve CORS para html2canvas)
 */
export const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return ''
  
  // Se já é uma URL do Supabase storage ou proxy, não precisa proxiar
  if (imageUrl.includes('supabase.co')) return imageUrl
  
  // Se já está usando o proxy, não duplicar
  if (imageUrl.includes('/functions/v1/image-proxy')) return imageUrl
  
  // Se é uma URL HTTP(S), usar o proxy
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(imageUrl)}`
  }
  
  return imageUrl
}

/**
 * Processa URL de imagem para uso em PDF (normaliza + proxy)
 * Use esta função sempre que precisar de uma imagem no PDF
 */
export const getImageUrlForPdf = (rawUrl: unknown): string => {
  const normalized = normalizeImageUrl(rawUrl)
  return getProxiedImageUrl(normalized)
}

/**
 * Processa múltiplas URLs de imagem para uso em PDF (normaliza + proxy)
 * Retorna array de URLs prontas para o PDF (até maxImages)
 */
export const getMultipleImagesForPdf = (rawUrl: unknown, maxImages: number = 4): string[] => {
  const urls = extractMultipleImageUrls(rawUrl, maxImages)
  return urls.map(url => getProxiedImageUrl(url))
}

/**
 * Retorna a URL da foto de capa para o PDF.
 * Se não houver foto, retorna undefined para que o componente use seu próprio fallback.
 * Isso evita que imagens cacheadas de avaliações anteriores sejam exibidas.
 */
export const getCoverPhotoForPdf = (fotoCapa: string | null | undefined): string | null => {
  // Se não há foto ou é string vazia, retorna null explicitamente
  if (!fotoCapa || fotoCapa.trim() === '') {
    return null
  }
  
  // Normaliza e retorna a URL via proxy
  return getImageUrlForPdf(fotoCapa)
}
