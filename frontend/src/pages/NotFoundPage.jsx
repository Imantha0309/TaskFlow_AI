import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page is not on the list</h1>
      <p className={styles.description}>
        The page you are looking for does not exist, moved, or never made it into the plan.
      </p>
      <Link className={styles.link} to="/">
        Back to dashboard
      </Link>
    </div>
  )
}
