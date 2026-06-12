# Phase 3 — Blockers & Deferred Items

> Author: Dex (@dev) · Phase 3 / Subtasks 3.2–3.5 · Date: 2026-06-12

This document records items that were intentionally deferred (with rationale)
during the AvaMax separation, plus anything that blocked a subtask. None of the
items below blocked completion of Subtasks 3.2–3.5 — they are forward-looking
notes for Phase 4 / Phase 5.

## No hard blockers

All four subtasks (3.2–3.5) completed. `npm run typecheck`, `npm run lint`
(no new errors vs the AvaLuz baseline) and `npm run build` all pass.

## Deferred (by design)

### 1. `.remax-theme` / `.remax-dark` CSS class names (COUPLING C3, C7)
The brand-specific wrapper classes `.remax-theme` and `.remax-dark` are still
used across ~30 layout/PDF components and their CSS definitions. They were **not**
renamed because:
- they are internal class names (not user-facing),
- the backing CSS still exists and renaming all occurrences + definitions at once
  risks breaking the visual theme with no running app to verify,
- Phase 5's branding engine (`<DynamicTheme/>`) is the intended place to
  generalize them.

A generic seam is already in place: `TenantThemeProvider` + the `.tenant-theme`
class + `src/theme/avamax.css` CSS variables. New code should prefer
`var(--tenant-primary)` and `.tenant-theme`.

**Action (Phase 5):** migrate `.remax-theme`/`.remax-dark` consumers to the
tenant-driven theme variables and remove the brand-named classes.

### 2. PDF page assets remain statically imported (COUPLING C1 partial)
Layout chrome (headers/sidebars) now references the AvaMax logo via the
public path `/assets/avamax-brand.png` (served, not bundled). The ~30 PDF page
components under `src/pages/Pdf/remax/**` still use
`import avamaxLogo from '@/assets/avamax-brand.png'` because they render through
html2canvas, where bundled (data-URI) assets avoid the CORS/timing failures the
codebase documents in `src/main.tsx`. PDF branding is instead parametrized at the
dialog boundary via `companyName` / `logoUrl` / `primaryColor` props.

**Action (Phase 5):** when the branding engine provides a stable logo URL,
revisit whether PDF pages can consume `logoUrl` without breaking html2canvas.

### 3. Hardcoded `@remax.com.br` domain check (COUPLING B8)
`src/hooks/useTeamSubscription.ts` and `src/pages/Time/TeamMembers.tsx` still
detect "unlimited seats" by `email.endsWith('@remax.com.br')`. Per
TENANT-STRATEGY §4.3 this should resolve via `tenants.domains`.

**Action (Phase 4):** replace the literal domain check with a tenant-domains
lookup. A `TODO(Phase 4)` marker is left at the TeamMembers call site.

### 6. Tailwind arbitrary color + opacity modifier
Solid `#003DA5` usages in `RemaxOnboarding`/`RemaxPending` were converted to
`bg-[var(--tenant-primary)]`. Cases with an **opacity modifier**
(`bg-[#003DA5]/30`) were intentionally **kept as literal hex** because Tailwind
3.4 cannot inject an alpha channel into a bare `var()` arbitrary color, so
`[var(--tenant-primary)]/30` would render fully opaque (a silent visual bug).

**Action (Phase 5):** expose the brand primary as HSL channel values
(e.g. `--tenant-primary-hsl: 214 100% 32%`) so Tailwind's `/opacity` modifier
works with the variable, then convert the remaining literal hex usages.

### 4. `organization === 'remax'` discriminator (COUPLING B1–B4)
The tenant discriminator is now centralized: guards/SignIn read
`tenant.organization` from `TenantContext` instead of the literal `'remax'`.
The underlying `profiles.organization` column itself (and the
`remax_*` schema) is a backend concern owned by Phase 4 (introduce real
`tenant_id`). The frontend is ready to switch the discriminator source.

### 5. Orphaned originals kept for reference
`RemaxPdfPreviewDialog.tsx` is now unused by consumers (they use
`TenantPdfPreviewDialog`) but was kept to minimize churn; it still compiles.
`RemaxDarkThemeStyles.tsx` is **still used** by the `RemaxReport` PDF pages, so
it remains. `TenantPdfDarkThemeStyles.tsx` is the parametrized replacement,
ready for when the report pages adopt it.

## Repository note

The execution plan referenced `avaluz/avamax-frontend`; the actual repository
is `melointhecloud/avamax-frontend`. All work targets the actual repo.
