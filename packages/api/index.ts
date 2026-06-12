/**
 * @avaluz/api — Cliente de API abstrato e tenant-aware (AvaLuz + AvaMax).
 *
 * Uso:
 *   import { APIClient } from "@avaluz/api";
 *   const api = new APIClient({ tenant_id: "avaluz" });
 */
export { APIClient, createAPIClient } from "./src/client";
export {
  injectTenantContext,
  tenantHeaders,
  TENANT_HEADER,
  TENANT_COLUMN,
} from "./src/helpers";
export type {
  APIClientConfig,
  TableName,
  Row,
  SupabaseLike,
} from "./src/types";
