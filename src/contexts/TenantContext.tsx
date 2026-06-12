import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * TenantContext — centralizes tenant identity for the AvaMax frontend.
 *
 * Phase 3 goal: remove the `organization === 'remax'` / `/remax` hardcodes that
 * were scattered across guards, hooks and the router. Everything tenant-specific
 * now reads from this single source of truth.
 *
 * In this separated repo the tenant is statically AvaMax. The shape is designed
 * so that Phase 5 can swap the static config for a DB-driven `brands` lookup
 * (resolved by domain / JWT claim / URL slug) without touching any consumer.
 */
export interface TenantConfig {
  /** URL slug used to build tenant-aware paths, e.g. `/avamax/home`. */
  slug: string;
  /**
   * Backend discriminator that matches `profiles.organization`. This is the
   * value previously hardcoded as the string `'remax'`.
   */
  organization: string;
  /** Human-facing brand name (used in titles, PDFs, fallbacks). */
  brandName: string;
  /** Tenant CSS variables, applied by TenantThemeProvider. */
  cssVars: Record<string, string>;
  /** Public asset paths (served from /public, not statically imported). */
  assets: {
    brandLogo: string;
    logo: string;
  };
}

/** Default (and currently only) tenant for this repo: AvaMax / RE/MAX. */
export const AVAMAX_TENANT: TenantConfig = {
  slug: 'avamax',
  organization: 'remax',
  brandName: 'AvaMax',
  cssVars: {
    '--tenant-primary': '#003DA5',
    '--tenant-primary-hover': '#002f7d',
    '--tenant-accent': '#CC0000',
    '--tenant-accent-hover': '#a30000',
    '--tenant-on-primary': '#ffffff',
    '--tenant-on-accent': '#ffffff',
  },
  assets: {
    brandLogo: '/assets/avamax-brand.png',
    logo: '/assets/avamax-logo.png',
  },
};

interface TenantContextValue {
  tenant: TenantConfig;
}

const TenantContext = createContext<TenantContextValue>({ tenant: AVAMAX_TENANT });

interface TenantProviderProps {
  children: ReactNode;
  /** Override for tests or future multi-tenant resolution. */
  tenant?: TenantConfig;
}

export function TenantProvider({ children, tenant = AVAMAX_TENANT }: TenantProviderProps) {
  const value = useMemo(() => ({ tenant }), [tenant]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

/** Read the active tenant config. */
export function useTenant(): TenantConfig {
  return useContext(TenantContext).tenant;
}
