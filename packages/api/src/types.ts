/**
 * @avaluz/api — Contrato de API.
 *
 * Reutiliza os tipos centrais de `@avaluz/types` (Database gerado do Supabase)
 * para tipar entradas/saídas do cliente, evitando redefinição manual.
 */
import type { Database } from "@avaluz/types";

/** Nome de uma tabela do schema público. */
export type TableName = keyof Database["public"]["Tables"] & string;

/** Linha (row) de uma tabela do schema público. */
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

/** Configuração de instanciação do cliente. */
export interface APIClientConfig {
  /** Identificador do tenant ativo (obrigatório). */
  tenant_id: string;
  /**
   * Cliente Supabase a ser usado. Opcional — quando omitido, usa o cliente
   * compartilhado do app. Permite injeção de mock em testes e clientes
   * distintos por frontend (AvaLuz/AvaMax).
   */
  supabase?: SupabaseLike;
}

/**
 * Superfície mínima do cliente Supabase consumida por `APIClient`. Estrutural
 * para não acoplar à tipagem interna do supabase-js (facilita testes/mocks).
 */
export interface SupabaseLike {
  auth: unknown;
  from(table: string): unknown;
  functions: {
    invoke(name: string, options?: { headers?: Record<string, string>; body?: unknown }): Promise<unknown>;
  };
}
