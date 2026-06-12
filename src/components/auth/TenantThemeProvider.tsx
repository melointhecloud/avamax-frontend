import { ReactNode, useMemo } from 'react';
import { useTenant } from '@/contexts/TenantContext';

interface TenantThemeProviderProps {
  children: ReactNode;
}

/**
 * Generic, tenant-aware theme wrapper. Replaces the brand-specific
 * RemaxThemeProvider: instead of a hardcoded `.remax-theme` class, it applies
 * the active tenant's CSS variables (theme.cssVars) onto a `.tenant-theme`
 * wrapper so every `var(--tenant-*)` resolves to the current brand.
 */
export function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const tenant = useTenant();

  const style = useMemo(() => tenant.cssVars as React.CSSProperties, [tenant.cssVars]);

  return (
    <div className="tenant-theme" style={style}>
      {children}
    </div>
  );
}
