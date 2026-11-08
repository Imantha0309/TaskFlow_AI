import { cx } from '@/lib/cx'
import styles from './Badge.module.css'

/**
 * @param {object} props
 * @param {'neutral' | 'primary' | 'success' | 'warning' | 'danger'} [props.tone]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function Badge({ tone = 'neutral', children, className }) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>
}
