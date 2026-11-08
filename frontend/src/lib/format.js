const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Formats a `date` column value without shifting the day across time zones.
 *
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function formatDate(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}

/**
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : dateTimeFormatter.format(date)
}

/**
 * Returns a friendly display name for an authenticated user.
 *
 * @param {import('@supabase/supabase-js').User | null} user
 * @returns {string}
 */
export function getDisplayName(user) {
  const metadataName = user?.user_metadata?.full_name
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim()
  }

  const email = user?.email ?? ''
  const [localPart] = email.split('@')
  return localPart || 'there'
}
