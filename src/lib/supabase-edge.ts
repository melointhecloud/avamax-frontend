import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface InvokeOptions {
  body?: Record<string, unknown>
  headers?: Record<string, string>
  /** If true, suppresses the error toast (useful for background checks) */
  silent?: boolean
}

interface InvokeResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Wrapper around supabase.functions.invoke with standardized error handling.
 * 
 * - Checks for transport-level errors (network, 5xx, etc.)
 * - Checks for application-level errors (response JSON with `error` or `message` fields)
 * - Logs full details to console.error
 * - Shows a toast with the real API message (unless `silent: true`)
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: InvokeOptions = {}
): Promise<InvokeResult<T>> {
  const { body, headers, silent = false } = options

  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body,
      headers,
    })

    // 1. Transport-level error (network failure, CORS, non-2xx that Supabase SDK catches)
    if (error) {
      const message = extractMessage(error) || `Erro ao chamar ${functionName}`
      console.error(`[EdgeFunction:${functionName}] Transport error:`, {
        error,
        body,
      })
      if (!silent) toast.error(message)
      return { data: null, error: new Error(message) }
    }

    // 2. Application-level error — the function returned 200 but with an error payload
    const appError = extractAppError(data)
    if (appError) {
      console.error(`[EdgeFunction:${functionName}] App error:`, {
        response: data,
        body,
      })
      if (!silent) toast.error(appError)
      return { data: null, error: new Error(appError) }
    }

    return { data, error: null }
  } catch (err) {
    const message = extractMessage(err) || `Erro inesperado ao chamar ${functionName}`
    console.error(`[EdgeFunction:${functionName}] Unexpected error:`, {
      error: err,
      body,
    })
    if (!silent) toast.error(message)
    return { data: null, error: err instanceof Error ? err : new Error(message) }
  }
}

/**
 * Same as invokeEdgeFunction but automatically attaches the user's Bearer token.
 * Returns null (with toast) if no session is found.
 */
export async function invokeAuthenticatedEdgeFunction<T = unknown>(
  functionName: string,
  options: InvokeOptions = {}
): Promise<InvokeResult<T>> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    const msg = 'Sessão expirada. Faça login novamente.'
    if (!options.silent) toast.error(msg)
    return { data: null, error: new Error(msg) }
  }

  return invokeEdgeFunction<T>(functionName, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// --- Helpers ---

function extractMessage(err: unknown): string | null {
  if (!err) return null
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error === 'string') return obj.error
    if (typeof obj.msg === 'string') return obj.msg
  }
  return null
}

function extractAppError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>

  // Common patterns: { error: "msg" }, { success: false, error: "msg" }, { message: "err" }
  if (obj.success === false) {
    if (typeof obj.error === 'string') return obj.error
    if (typeof obj.message === 'string') return obj.message
  }
  // Direct error field (when there's no success field)
  if (typeof obj.error === 'string' && !('success' in obj)) return obj.error

  return null
}
