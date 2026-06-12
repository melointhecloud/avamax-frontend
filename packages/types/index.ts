/**
 * @avaluz/types — Tipos e schemas centrais (AvaLuz + AvaMax)
 *
 * Bridge incremental (Phase 2): re-exporta os tipos de domínio que hoje vivem em
 * `src/types` e o tipo `Database` gerado do Supabase. Reutilizável por ambos os
 * frontends e pelo cliente `@avaluz/api`.
 *
 * Uso: `import type { EvaluationResult, Database, Tables } from "@avaluz/types";`
 */

// Tipos de domínio (avaliação de imóveis)
export type {
  SimilarProperty,
  EvaluationResult,
  EvaluationState,
  EditMode,
  EditTabId,
} from "../../src/types/evaluation";
export { EDIT_TAB_IDS } from "../../src/types/evaluation";

// Schema do banco (Supabase) — fonte de verdade para entidades persistidas
export type {
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../src/integrations/supabase/types";
