import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { HttpError } from './http.ts'

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

/**
 * Client that acts as the calling user. It forwards the incoming Authorization
 * header, so RLS applies exactly as it does in the browser.
 */
export function createUserClient(authorization: string): SupabaseClient {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'), {
    global: {
      headers: { Authorization: authorization },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Privileged client. It bypasses RLS, so only use it inside Edge Functions
 * after validating the caller, and never expose its results without checks.
 * The service_role key comes from server-side secrets only.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Validates the request's bearer token and returns the user plus a
 * user-scoped client. Throws HttpError(401) when the session is missing or
 * invalid.
 */
export async function requireUser(request: Request): Promise<{
  user: { id: string; email?: string }
  supabase: SupabaseClient
}> {
  const authorization = request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing or malformed Authorization header.', 'unauthorized')
  }

  const supabase = createUserClient(authorization)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new HttpError(401, 'Your session is invalid or has expired.', 'invalid_session')
  }

  return { user: data.user, supabase }
}
