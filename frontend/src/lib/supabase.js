import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/**
 * The single Supabase browser client.
 *
 * `null` when the environment is incomplete, which lets the UI render a setup
 * notice instead of crashing. Services access the client through
 * `getClient()` in `services/apiClient.js`.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'taskflow-ai',
        },
      },
    })
  : null

export const isSupabaseReady = supabase !== null
