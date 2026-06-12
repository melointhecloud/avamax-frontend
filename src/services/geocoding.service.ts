// Geocoding service using OpenStreetMap Nominatim API

export interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
}

/**
 * Geocode an address to get coordinates using OpenStreetMap Nominatim
 * @param address - The address to geocode (e.g., "Bairro, Município, Estado, Brasil")
 * @returns Promise with lat/lng coordinates or null if not found
 */
export async function geocodeAddress(
  bairro: string,
  municipio: string,
  estado: string
): Promise<GeocodingResult | null> {
  try {
    // Build search query
    const searchQuery = [bairro, municipio, estado, 'Brasil']
      .filter(Boolean)
      .join(', ')

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'br')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Avaluz/1.0 (Property Evaluation App)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status)
      return null
    }

    const data = await response.json()

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }
    }

    // Fallback: try without bairro
    if (bairro) {
      return geocodeAddress('', municipio, estado)
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
