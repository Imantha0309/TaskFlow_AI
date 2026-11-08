import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.svg'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { LoadingState } from '@/components/common/LoadingState'
import { SetupNotice } from '@/components/common/SetupNotice'
import { useAuth } from '@/hooks/useAuth'
import styles from './LoginPage.module.css'

const FEATURES = [
  'Capture tasks in seconds, not minutes.',
  'Let AI turn fuzzy goals into clear next steps.',
  'Stay in sync across devices with realtime updates.',
]

export default function LoginPage() {
  const { signIn, signUp, status, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  if (status === 'unavailable') {
    return (
      <main className={styles.setupPage}>
        <SetupNotice />
      </main>
    )
  }

  if (status === 'loading' || isAuthenticated) {
    return (
      <main className={styles.setupPage}>
        <LoadingState
          message={isAuthenticated ? 'Taking you to your workspace…' : 'Checking your session…'}
        />
      </main>
    )
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      const credentials = { email: email.trim(), password }

      if (mode === 'signin') {
        await signIn(credentials)
        navigate(redirectTo, { replace: true })
      } else {
        const data = await signUp(credentials)

        if (data.session) {
          navigate(redirectTo, { replace: true })
        } else {
          setNotice('Account created. Check your inbox to confirm your email, then sign in.')
          setMode('signin')
          setPassword('')
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Link to="/" className={styles.brand} aria-label="TaskFlow AI home">
          <img src={logo} alt="" width="40" height="40" />
          <span>TaskFlow AI</span>
        </Link>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>AI-powered focus</p>
          <h1 className={styles.heroTitle}>Make room for the work that matters.</h1>
          <p className={styles.heroLead}>
            A calm, lightweight task manager that helps you decide what to do next — and then gets
            out of your way.
          </p>

          <ul role="list" className={styles.features}>
            {FEATURES.map((feature) => (
              <li key={feature} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden="true">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.heroFootnote}>
          Built with React, Supabase, and a deliberately small stack.
        </p>
      </section>

      <section className={styles.formPanel} aria-labelledby="auth-title">
        <div className={styles.formInner}>
          <p className={styles.formEyebrow}>
            {mode === 'signin' ? 'Welcome back' : 'Create your workspace'}
          </p>
          <h2 id="auth-title" className={styles.formTitle}>
            {mode === 'signin' ? 'Sign in to TaskFlow AI' : 'Start your first task'}
          </h2>
          <p className={styles.formLead}>
            {mode === 'signin'
              ? 'Pick up where you left off.'
              : 'Create an account to keep your tasks private and in sync.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              required
              minLength={6}
              hint={mode === 'signup' ? 'At least 6 characters.' : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            ) : null}

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className={styles.switch}>
            {mode === 'signin' ? 'New to TaskFlow AI?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className={styles.switchButton}
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>

          <p className={styles.footnote}>
            Authentication is handled by Supabase. If email confirmation is enabled in your project,
            confirm your address before signing in.
          </p>
        </div>
      </section>
    </div>
  )
}
