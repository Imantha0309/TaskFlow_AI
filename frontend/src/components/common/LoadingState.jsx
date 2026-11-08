import { cx } from '@/lib/cx'
import { Spinner } from './Spinner'
import styles from './LoadingState.module.css'

/**
 * @param {object} props
 * @param {string} [props.message]
 * @param {boolean} [props.compact]
 * @param {string} [props.className]
 */
export function LoadingState({ message = 'Loading…', compact = false, className }) {
  return (
    <div
      className={cx(styles.wrapper, compact && styles.compact, className)}
      role="status"
      aria-live="polite"
    >
      <Spinner label={null} />
      <p className={styles.message}>{message}</p>
    </div>
  )
}
