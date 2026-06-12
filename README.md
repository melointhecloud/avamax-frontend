# AvaMax Frontend

White-label frontend for **AvaMax** (RE/MAX), separated from the AvaLuz monorepo.

This app consumes shared packages (`@avaluz/ui`, `@avaluz/lib`, `@avaluz/types`, `@avaluz/api`) and renders branding/routes dynamically per tenant — no hardcoded `/remax` routes or branding.

> Created as part of **Phase 3 — Separação do AvaMax** of the Avaluz refactoring plan.

---

## Tech Stack

- **Build:** Vite
- **Framework:** React + TypeScript
- **Backend:** Supabase (auth, database, storage)
- **Styling:** Tailwind CSS + shadcn/ui (via `@avaluz/ui`)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A package manager (npm / pnpm / bun)
- Access to the target Supabase project

### Setup

```bash
# 1. Clone
git clone https://github.com/melointhecloud/avamax-frontend.git
cd avamax-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in the values (see Environment Variables below)

# 4. Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

---

## Environment Variables

Copy `.env.example` to `.env.local` and provide values. **Never commit real secrets.**

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) API key |

Only `VITE_`-prefixed variables are exposed to the client bundle by Vite.

CI/CD reads these from GitHub repository **secrets** of the same name (see `.github/workflows/`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run the test suite |

---

## Branch Strategy

- `main` — protected. Requires 1 approving review + passing status checks. No direct pushes.
- `dev` — integration branch for ongoing work.
- Feature branches → PR into `dev` → PR into `main`.

---

## Project Structure

```
src/
├── contexts/
│   ├── TenantContext.tsx      # Single source of truth for tenant identity (slug, organization, brandName, cssVars, assets)
│   └── AuthContext.tsx
├── components/auth/
│   ├── TenantRoute.tsx        # Tenant-aware guard (replaces ProtectedRoute + RemaxRoute)
│   ├── TenantThemeProvider.tsx# Applies tenant CSS variables (replaces RemaxThemeProvider)
│   ├── MfrRoute.tsx / CeoRoute.tsx
├── components/pdf/
│   ├── TenantPdfPreviewDialog.tsx     # Parametrizable PDF dialog (companyName / logoUrl / primaryColor)
│   └── TenantPdfDarkThemeStyles.tsx   # Parametrizable dark-theme styles
├── hooks/useTenantPrefix.ts   # Tenant-aware path helper (replaces useRemaxPrefix)
├── theme/avamax.css           # AvaMax CSS variables (--tenant-primary, etc.)
└── routes/index.tsx           # Routes served at root (no /remax namespace)

packages/                       # Bundled shared design system (@avaluz/ui, lib, types, api)
public/assets/                  # Brand assets served (not statically imported)
```

### Shared packages

`packages/*` are bundled into this repo (not consumed from the monorepo) so the
app is self-contained and the `@avaluz/*` path aliases resolve unchanged. They
keep the `@avaluz/*` scope because they are the **shared** design system used by
both AvaLuz and AvaMax (per Phase 2).

### Tenancy & branding

- Tenant identity lives in `TenantContext` (`AVAMAX_TENANT` is the default/only
  tenant). When Phase 5's `brands` table lands, swap the static config for a
  DB-driven lookup — no consumer changes needed.
- Branding is driven by CSS variables (`var(--tenant-primary)`, etc.) defined in
  `src/theme/avamax.css` and applied via `TenantThemeProvider`.
- Routes are served at the root (`/home`, `/avaliar`, `/time/*`, `/mfr/*`,
  `/ceo/*`) — the `/remax` namespace from the monorepo was removed.

See `docs/BLOCKERS.md` for deferred items (Phase 4 / Phase 5).

---

## Status

✅ **Subtasks 3.2–3.5 complete** — base structure copied, branding isolated,
routes de-namespaced, PDF templates parametrized. `typecheck`, `lint` and `build`
all pass. Pending: Phase 4 (backend `tenant_id`) and Phase 5 (branding engine).
