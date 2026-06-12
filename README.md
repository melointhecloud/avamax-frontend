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

## Status

🚧 **Phase 3 in progress** — repository scaffolding. Application structure (Subtasks 3.2–3.5) is migrated separately by @dev.
