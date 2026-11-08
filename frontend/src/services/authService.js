import { isSupabaseReady } from '@/lib/supabase'
import { ApiError, getClient, run, toApiError } from './apiClient'

const UNCONFIGURED_MESSAGE =
  'Authentication is unavailable until Supabase is configured in frontend/.env.'

/**
 * Returns the current session, or null when signed out / unconfigured.
 *
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function getSession() {
  if (!isSupabaseReady) return null

  try {
    const { data, error } = await getClient().auth.getSession()
    if (error) throw toApiError(error)
    return data.session
  } catch (error) {
    throw toApiError(error, 'Your session could not be restored.')
  }
}

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import('@supabase/supabase-js').AuthTokenResponsePassword['data']>}
 */
export async function signIn({ email, password }) {
  if (!isSupabaseReady)
    throw new ApiError(UNCONFIGURED_MESSAGE, { code: 'supabase_not_configured' })

  return run(getClient().auth.signInWithPassword({ email, password }), {
    fallbackMessage: 'Unable to sign in. Check your email and password and try again.',
  })
}

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import('@supabase/supabase-js').AuthResponse['data']>}
 */
export async function signUp({ email, password }) {
  if (!isSupabaseReady)
    throw new ApiError(UNCONFIGURED_MESSAGE, { code: 'supabase_not_configured' })

  const emailRedirectTo =
    typeof window !== 'undefined' ? new URL('/login', window.location.origin).toString() : undefined

  return run(
    getClient().auth.signUp({
      email,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    }),
    { fallbackMessage: 'Unable to create your account. Please try again.' }
  )
}

/**
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (!isSupabaseReady) return

  await run(getClient().auth.signOut(), {
    fallbackMessage: 'Unable to sign out. Please try again.',
  })
}

/**
 * Subscribes to auth state changes. Returns an unsubscribe function.
 *
 * @param {(event: string, session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {() => void}
 */
export function subscribeToAuthChanges(callback) {
  if (!isSupabaseReady) return () => {}

  const {
    data: { subscription },
  } = getClient().auth.onAuthStateChange((event, session) => callback(event, session))

  return () => subscription.unsubscribe()
}
