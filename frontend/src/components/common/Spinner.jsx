import { cx } from '@/lib/cx'
import styles from './Spinner.module.css'

/**
 * @param {object} props
 * @param {'sm' | 'md' | 'lg'} [props.size]
 * @param {string | null} [props.label] - Set to null when a parent already announces loading.
 * @param {string} [props.className]
 */
export function Spinner({ size = 'md', label = 'Loading…', className }) {
  return (
    <span
      className={cx(styles.spinner, styles[size], className)}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : 'true'}
    >
      {label ? <span className="visually-hidden">{label}</span> : null}
    </span>
  )
}
