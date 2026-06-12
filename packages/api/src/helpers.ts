/**
 * @avaluz/api — Helpers de injeção de contexto de tenant.
 *
 * Centraliza o ponto onde o `tenant_id` é aplicado às queries e requisições.
 * Forward-compatible com a Phase 4 (quando as tabelas ganham a coluna
 * `tenant_id` + RLS por tenant). Hoje o helper é seguro de chamar e mantém o
 * contrato estável para AvaLuz e AvaMax.
 */

/** Header padrão usado por Edge Functions para identificar o tenant. */
export const TENANT_HEADER = "X-Tenant-ID";

/** Coluna padrão usada para isolamento por tenant nas tabelas (Phase 4). */
export const TENANT_COLUMN = "tenant_id";

/**
 * Estrutura mínima de um query builder filtrável (compatível com o
 * PostgrestFilterBuilder do supabase-js, sem acoplar à sua tipagem interna).
 */
export interface FilterableQuery<T> {
  eq(column: string, value: string): T;
}

/**
 * Aplica o filtro de tenant a uma query. Use em qualquer leitura/escrita que
 * deva respeitar o isolamento por tenant.
 */
export function injectTenantContext<T>(
  query: FilterableQuery<T>,
  tenantId: string,
  column: string = TENANT_COLUMN,
): T {
  return query.eq(column, tenantId);
}

/** Monta os headers de tenant para chamadas a Edge Functions / fetch. */
export function tenantHeaders(tenantId: string): Record<string, string> {
  return { [TENANT_HEADER]: tenantId };
}
