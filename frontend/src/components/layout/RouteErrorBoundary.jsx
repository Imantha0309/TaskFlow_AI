import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import styles from './RouteErrorBoundary.module.css'

/**
 * Last-resort route error boundary. Avoids leaking implementation details in
 * production while showing the real error during development.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const isResponse = isRouteErrorResponse(error)

  const title = isResponse
    ? `${error.status} ${error.statusText || 'Unexpected error'}`
    : 'Something went wrong'

  const detail = isResponse
    ? typeof error.data === 'object' && error.data && 'message' in error.data
      ? String(error.data.message)
      : null
    : error instanceof Error
      ? error.message
      : null

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>TaskFlow AI</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>
        An unexpected error interrupted this page. Reload to try again, or head back to your
        dashboard.
      </p>

      {import.meta.env.DEV && detail ? <pre className={styles.detail}>{detail}</pre> : null}

      <div className={styles.actions}>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
        <Link className={styles.link} to="/">
          Go to dashboard
        </Link>
      </div>
    </main>
  )
}
