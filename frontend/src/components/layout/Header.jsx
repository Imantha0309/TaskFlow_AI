import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.svg'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import styles from './Header.module.css'

/**
 * @param {object} props
 * @param {() => void} props.onToggleSidebar
 * @param {boolean} props.isSidebarOpen
 */
export function Header({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, status, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()
    } catch (error) {
      console.error('[TaskFlow AI] Sign out failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
        >
          {isSidebarOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <Link to="/" className={styles.brand} aria-label="TaskFlow AI home">
          <img className={styles.logo} src={logo} alt="" width="32" height="32" />
          <span className={styles.brandName}>
            TaskFlow <span className={styles.brandAccent}>AI</span>
          </span>
        </Link>

        <div className={styles.spacer} />

        <div className={styles.account}>
          {isAuthenticated ? (
            <>
              <span className={styles.email} title={user?.email ?? undefined}>
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} isLoading={isSigningOut}>
                Sign out
              </Button>
            </>
          ) : status === 'unavailable' ? (
            <Badge tone="warning">Setup needed</Badge>
          ) : (
            <Link to="/login" className={styles.signInLink}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
