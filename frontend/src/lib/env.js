/**
 * Reads and validates the frontend environment.
 *
 * Vite only exposes variables prefixed with `VITE_` and inlines them at build
 * time. Values are therefore public: never place secrets here.
 */

function read(key) {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : ''
}

export const SUPABASE_URL = read('VITE_SUPABASE_URL')
export const SUPABASE_ANON_KEY = read('VITE_SUPABASE_ANON_KEY')

/** @type {string[]} */
export const envIssues = []

if (!SUPABASE_URL) {
  envIssues.push(
    'VITE_SUPABASE_URL is missing. Copy .env.example to .env and set your project URL.'
  )
} else {
  try {
    const url = new URL(SUPABASE_URL)
    if (!['http:', 'https:'].includes(url.protocol)) {
      envIssues.push('VITE_SUPABASE_URL must start with http:// or https://.')
    }
  } catch {
    envIssues.push('VITE_SUPABASE_URL is not a valid URL.')
  }
}

if (!SUPABASE_ANON_KEY) {
  envIssues.push(
    'VITE_SUPABASE_ANON_KEY is missing. Use the anon/publishable key from your Supabase project.'
  )
} else if (SUPABASE_ANON_KEY.length < 20) {
  envIssues.push('VITE_SUPABASE_ANON_KEY looks too short to be a Supabase anon/publishable key.')
} else if (SUPABASE_ANON_KEY.startsWith('sb_secret_')) {
  envIssues.push(
    'VITE_SUPABASE_ANON_KEY contains a Supabase secret key. Use the publishable key instead and rotate the secret.'
  )
} else if (getJwtRole(SUPABASE_ANON_KEY) === 'service_role') {
  envIssues.push(
    'VITE_SUPABASE_ANON_KEY contains a service_role key. Remove it immediately and use the anon/publishable key instead.'
  )
}

/**
 * Best-effort JWT payload decoder used only to catch accidental secret keys.
 * Publishable keys (`sb_publishable_...`) are not JWTs and return null.
 *
 * @param {string} token
 * @returns {Record<string, unknown> | null}
 */
function getJwtRole(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(payload))
    return typeof decoded.role === 'string' ? decoded.role : null
  } catch {
    return null
  }
}

export const isSupabaseConfigured = envIssues.length === 0

if (import.meta.env.DEV && envIssues.length > 0) {
  console.warn(
    `[TaskFlow AI] Supabase is not configured yet:\n- ${envIssues.join('\n- ')}\n` +
      'The app will render the setup screen until valid credentials are provided.'
  )
}
