# @avaluz/api

Cliente de API **abstrato e tenant-aware** compartilhado entre AvaLuz e AvaMax.
Encapsula o Supabase e centraliza a injeção do contexto de tenant.

## Status — Phase 2 (Subtask 2.4 — @data-engineer)

Skeleton funcional do cliente. O isolamento por tenant é **forward-compatible**
com a Phase 4 (quando as tabelas ganham a coluna `tenant_id` + RLS por tenant).
Os pontos de injeção de tenant já estão centralizados em `src/helpers.ts`.

## Instalação / Resolução

Resolvido via workspace e alias `@avaluz/api` (ver `tsconfig.base.json` e
`vite.config.ts`).

## Uso

```ts
import { APIClient } from "@avaluz/api";

// Instanciação por tenant
const api = new APIClient({ tenant_id: "avaluz" });

// Auth
await api.auth.getSession();

// Perfil do usuário autenticado
const { data: profile } = await api.getMyProfile();

// Query bruta (sem filtro de tenant)
const { data } = await api.from("profiles").select("id, full_name");

// Query isolada por tenant (Phase 4: aplica WHERE tenant_id = <tenant>)
const { data: teams } = await api.tenantFrom("teams");

// Edge Function com header X-Tenant-ID injetado automaticamente
await api.invokeFunction("send-report", { body: { reportId: "123" } });
```

### Injeção de cliente (testes / múltiplos frontends)

```ts
const api = new APIClient({ tenant_id: "avamax", supabase: mockSupabase });
```

## API

| Membro | Descrição |
|--------|-----------|
| `new APIClient({ tenant_id, supabase? })` | Instancia o cliente para um tenant. Lança erro se `tenant_id` ausente. |
| `api.tenantId` | Tenant ativo da instância. |
| `api.auth` | Passthrough para `supabase.auth`. |
| `api.from(table)` | Query builder cru (sem filtro de tenant). |
| `api.tenantFrom(table)` | Query builder pré-filtrado por tenant (forward-compatible). |
| `api.getMyProfile()` | Perfil do usuário autenticado. |
| `api.invokeFunction(name, opts)` | Invoca Edge Function injetando `X-Tenant-ID`. |
| `createAPIClient(config)` | Atalho funcional equivalente a `new APIClient(config)`. |

### Helpers exportados

`injectTenantContext`, `tenantHeaders`, `TENANT_HEADER`, `TENANT_COLUMN`.

## Convenções

- O contrato de tipos reutiliza `@avaluz/types` (`Database` gerado do Supabase).
- Toda leitura/escrita isolada por tenant deve passar por `tenantFrom` ou
  `injectTenantContext` — nunca filtrar tenant manualmente espalhado pelo código.
