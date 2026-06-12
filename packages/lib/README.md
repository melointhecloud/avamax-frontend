# @avaluz/lib

Hooks e utilitários **transversais** compartilhados entre AvaLuz e AvaMax.

## Status — Phase 2 (Bridge incremental)

Re-exporta utilitários (`src/lib`), hooks transversais (`src/hooks`) e validadores
Zod (`src/validators`). Entrega o alias `@avaluz/lib` e a estrutura de workspace
sem quebrar o build. Migração física ocorre gradualmente.

## Uso

```ts
import { cn, useToast, useIsMobile, translateAuthError, signInSchema } from "@avaluz/lib";
```

## Exporta

| Categoria   | Itens |
|-------------|-------|
| Utilities   | `cn`, `translateAuthError` |
| Hooks       | `useToast`, `toast`, `useIsMobile` |
| Validadores | `signInSchema`, `signUpSchema`, `avaliarImovelSchema`, `buscarImoveisSchema`, `updateProfileSchema` (+ tipos inferidos) |

## Convenções

- Mantenha aqui apenas o que é genuinamente compartilhado/cross-cutting. Hooks de
  domínio específico (ex.: `useTeamDashboard`) permanecem em `src/hooks`.
- Sem efeitos colaterais de import (`sideEffects: false`).
