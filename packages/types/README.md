# @avaluz/types

Tipos e schemas **centrais** compartilhados entre AvaLuz e AvaMax.

## Status — Phase 2 (Bridge incremental)

Re-exporta tipos de domínio (`src/types`) e o tipo `Database` gerado do Supabase
(`src/integrations/supabase/types`). Entrega o alias `@avaluz/types` sem quebrar
o build. Migração física ocorre gradualmente.

## Uso

```ts
import type { EvaluationResult, Database, Tables } from "@avaluz/types";
```

## Exporta

| Categoria | Itens |
|-----------|-------|
| Domínio   | `SimilarProperty`, `EvaluationResult`, `EvaluationState`, `EditMode`, `EditTabId`, `EDIT_TAB_IDS` |
| Banco     | `Json`, `Database`, `Tables`, `TablesInsert`, `TablesUpdate` |

## Convenções

- Apenas **tipos** (sem runtime), exceto constantes derivadas de tipos como
  `EDIT_TAB_IDS`.
- `Database` é a fonte de verdade para entidades persistidas — derive tipos com
  `Tables<'nome_da_tabela'>` em vez de redefinir manualmente.
