/**
 * @avaluz/api — Cliente de API tenant-aware.
 *
 * Wrapper sobre o Supabase que carrega o contexto de tenant e o aplica de forma
 * consistente em leituras, escritas e chamadas a Edge Functions. Instanciável
 * por frontend (AvaLuz/AvaMax):
 *
 *   const api = new APIClient({ tenant_id: "avaluz" });
 *   const { data } = await api.getMyProfile();
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@avaluz/types";
import { supabase as defaultClient } from "../../../src/integrations/supabase/client";
import { injectTenantContext, tenantHeaders } from "./helpers";
import type { FilterableQuery } from "./helpers";
import type { APIClientConfig, TableName } from "./types";

export class APIClient {
  /** Tenant ativo desta instância. */
  readonly tenantId: string;

  /** Cliente Supabase subjacente (tipado contra o schema gerado). */
  private readonly client: SupabaseClient<Database>;

  constructor(config: APIClientConfig) {
    if (!config || !config.tenant_id) {
      throw new Error("APIClient requer um tenant_id válido.");
    }
    this.tenantId = config.tenant_id;
    this.client = (config.supabase as SupabaseClient<Database> | undefined) ?? defaultClient;
  }

  /** Acesso ao módulo de auth do Supabase. */
  get auth() {
    return this.client.auth;
  }

  /** Query builder cru para uma tabela (sem filtro de tenant). */
  from<T extends TableName>(table: T) {
    return this.client.from(table);
  }

  /**
   * Query builder pré-filtrado pelo tenant ativo. Forward-compatible com a
   * Phase 4 (coluna `tenant_id` + RLS). Use para qualquer dado isolado por
   * tenant.
   */
  tenantFrom<T extends TableName>(table: T) {
    const query = this.client.from(table).select("*");
    // Cast estrutural: a coluna `tenant_id` ainda não existe no schema gerado
    // (chega na Phase 4). O helper centraliza o ponto de injeção do filtro.
    return injectTenantContext(
      query as unknown as FilterableQuery<typeof query>,
      this.tenantId,
    );
  }

  /** Perfil do usuário autenticado. */
  async getMyProfile() {
    return this.client.from("profiles").select("*").single();
  }

  /**
   * Invoca uma Edge Function injetando o header de tenant (`X-Tenant-ID`).
   * Os headers extras são mesclados aos de tenant.
   */
  async invokeFunction<TBody = unknown>(
    name: string,
    options?: { body?: TBody; headers?: Record<string, string> },
  ) {
    return this.client.functions.invoke(name, {
      body: options?.body,
      headers: { ...tenantHeaders(this.tenantId), ...(options?.headers ?? {}) },
    });
  }
}

/** Atalho funcional para instanciar o cliente. */
export function createAPIClient(config: APIClientConfig): APIClient {
  return new APIClient(config);
}
