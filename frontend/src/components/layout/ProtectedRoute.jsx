import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { SetupNotice } from '@/components/common/SetupNotice'
import { useAuth } from '@/hooks/useAuth'
import styles from './ProtectedRoute.module.css'

/**
 * Gate for authenticated routes. Preserves the attempted URL so login can
 * return the user to where they were going.
 */
export function ProtectedRoute() {
  const { status, isAuthenticated } = useAuth()
  const location = useLocation()

  if (status === 'unavailable') {
    return (
      <div className={styles.gate}>
        <SetupNotice />
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={styles.gate}>
        <LoadingState message="Checking your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
