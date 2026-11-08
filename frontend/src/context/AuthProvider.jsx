import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/env'
import {
  getSession,
  signIn as signInRequest,
  signOut as signOutRequest,
  signUp as signUpRequest,
  subscribeToAuthChanges,
} from '@/services/authService'
import { AuthContext } from './auth-context'

/**
 * Owns the Supabase session and exposes auth actions to the app.
 * Renders the app even when Supabase is not configured; consumers can check
 * `status === 'unavailable'` and show a setup notice.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'unavailable')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    let active = true

    const applySession = (nextSession) => {
      if (!active) return
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'anonymous')
    }

    getSession()
      .then(applySession)
      .catch((error) => {
        if (!active) return
        console.error('[TaskFlow AI] Could not restore the session:', error)
        setSession(null)
        setStatus('anonymous')
      })

    const unsubscribe = subscribeToAuthChanges((_event, nextSession) => {
      applySession(nextSession)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (credentials) => {
    const data = await signInRequest(credentials)
    setSession(data.session)
    setStatus(data.session ? 'authenticated' : 'anonymous')
    return data
  }, [])

  const signUp = useCallback(async (credentials) => {
    const data = await signUpRequest(credentials)

    if (data.session) {
      setSession(data.session)
      setStatus('authenticated')
    }

    return data
  }, [])

  const signOut = useCallback(async () => {
    await signOutRequest()
    setSession(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      loading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      signIn,
      signUp,
      signOut,
    }),
    [session, status, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
