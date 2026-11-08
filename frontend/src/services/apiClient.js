import { supabase } from '@/lib/supabase'

/**
 * Normalized error type used by the whole service layer, so UI components
 * never have to understand Supabase error shapes.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, details?: unknown, status?: number, cause?: unknown }} [options]
   */
  constructor(message, { code = 'unknown_error', details = null, status = 0, cause } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.status = status
  }
}

/**
 * Human-friendly messages for the errors users are most likely to hit.
 * Keys are Supabase/PostgREST error codes.
 */
const FRIENDLY_MESSAGES = {
  // PostgREST / PostgreSQL
  '42P01': 'The database schema is missing. Apply the migrations in supabase/migrations first.',
  42501: 'You do not have permission to perform this action.',
  23505: 'That record already exists.',
  23514: 'Some of the submitted values are not valid.',
  23503: 'This action references a record that no longer exists.',
  PGRST116: 'The requested record was not found.',
  PGRST301: 'Your session has expired. Please sign in again.',

  // Supabase Auth
  invalid_credentials: 'Incorrect email or password. Please try again.',
  invalid_grant: 'Incorrect email or password. Please try again.',
  email_not_confirmed: 'Please confirm your email address before signing in. Check your inbox.',
  user_already_exists: 'An account with this email already exists. Try signing in instead.',
  email_exists: 'An account with this email already exists. Try signing in instead.',
  weak_password: 'That password is too weak. Use at least 6 characters.',
  over_email_send_rate_limit: 'Too many emails have been sent. Please wait a few minutes.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
  session_not_found: 'Your session has expired. Please sign in again.',
  supabase_not_configured:
    'Supabase is not configured. Add your project URL and anon key to frontend/.env, then restart the dev server.',
}

const NETWORK_ERROR_PATTERN = /failed to fetch|network ?error|network request failed|load failed/i

/**
 * Converts an unknown error into an ApiError with a readable message.
 *
 * @param {unknown} error
 * @param {string} [fallbackMessage]
 * @returns {ApiError}
 */
export function toApiError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) return error

  const source = /** @type {Record<string, any>} */ (error ?? {})
  const code = typeof source.code === 'string' ? source.code : ''
  const rawMessage = typeof source.message === 'string' ? source.message : ''
  const details = source.details ?? source.hint ?? null
  const status = Number(source.status ?? source.statusCode ?? 0) || 0

  let message = FRIENDLY_MESSAGES[code]

  if (!message && NETWORK_ERROR_PATTERN.test(rawMessage)) {
    message =
      'Could not reach Supabase. Check your internet connection and the VITE_SUPABASE_URL value.'
  }

  if (!message) {
    message = rawMessage || fallbackMessage
  }

  return new ApiError(message, {
    code: code || 'unknown_error',
    details,
    status,
    cause: error,
  })
}

/**
 * Returns the configured Supabase client or throws a user-facing error.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getClient() {
  if (!supabase) {
    throw new ApiError(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.',
      { code: 'supabase_not_configured' }
    )
  }

  return supabase
}

/**
 * Awaits a Supabase request and unwraps `{ data, error }`.
 * Any failure is normalized to ApiError.
 *
 * @template T
 * @param {PromiseLike<{ data: T, error: unknown }>} request
 * @param {{ fallbackMessage?: string }} [options]
 * @returns {Promise<T>}
 */
export async function run(request, { fallbackMessage } = {}) {
  try {
    const { data, error } = await request
    if (error) throw toApiError(error, fallbackMessage)
    return data
  } catch (error) {
    throw toApiError(error, fallbackMessage)
  }
}

/**
 * Invokes a Supabase Edge Function and normalizes failures.
 * The client automatically attaches the current user's access token.
 *
 * @param {string} name
 * @param {{ body?: unknown, headers?: Record<string, string>, method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' }} [options]
 * @returns {Promise<any>}
 */
export async function invokeFunction(name, { body, headers, method = 'POST' } = {}) {
  const client = getClient()
  const { data, error } = await client.functions.invoke(name, { body, headers, method })

  if (!error) return data

  let details = null

  try {
    if (error.context && typeof error.context.json === 'function') {
      details = await error.context.json()
    }
  } catch {
    details = null
  }

  const message =
    (details && typeof details === 'object' && 'error' in details && String(details.error)) ||
    error.message ||
    `The "${name}" function could not be reached.`

  throw new ApiError(message, {
    code:
      (details && typeof details === 'object' && 'code' in details && String(details.code)) ||
      'edge_function_error',
    details,
    status: error.context?.status ?? 0,
    cause: error,
  })
}
