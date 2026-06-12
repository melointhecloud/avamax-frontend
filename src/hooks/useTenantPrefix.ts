import { useCallback } from 'react'

/**
 * Returns a function that prefixes paths with the active tenant slug.
 *
 * Replaces useRemaxPrefix, which derived the prefix from `pathname.startsWith('/remax/')`.
 * In the separated AvaMax repo the app is single-tenant and routes are no longer
 * namespaced under `/remax`, so the prefixer is an identity. It is kept as a
 * tenant-aware seam: if/when routes become slug-prefixed (`/:slug/...`) for
 * multi-tenant previews, this is the single place that builds them (read the slug
 * from TenantContext here and prepend it).
 *
 * Usage: const p = useTenantPrefix(); navigate(p('/avaliar'))
 */
export function useTenantPrefix() {
  return useCallback((path: string) => path, [])
}
