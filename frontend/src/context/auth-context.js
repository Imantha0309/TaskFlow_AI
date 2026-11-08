import { createContext } from 'react'

/**
 * @typedef {'loading' | 'authenticated' | 'anonymous' | 'unavailable'} AuthStatus
 *
 * @typedef {object} AuthContextValue
 * @property {import('@supabase/supabase-js').Session | null} session
 * @property {import('@supabase/supabase-js').User | null} user
 * @property {AuthStatus} status
 * @property {boolean} loading
 * @property {boolean} isAuthenticated
 * @property {(credentials: { email: string, password: string }) => Promise<unknown>} signIn
 * @property {(credentials: { email: string, password: string }) => Promise<unknown>} signUp
 * @property {() => Promise<void>} signOut
 */
export const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null))
