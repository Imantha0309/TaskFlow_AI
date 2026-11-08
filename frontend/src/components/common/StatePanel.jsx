import { cx } from '@/lib/cx'
import styles from './StatePanel.module.css'

/**
 * Shared presentation for empty and error states.
 *
 * @param {object} props
 * @param {'neutral' | 'danger'} [props.tone]
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
export function StatePanel({ tone = 'neutral', icon, title, description, action, className }) {
  return (
    <div
      className={cx(styles.panel, styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {icon ? (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <div className={styles.description}>{description}</div> : null}
      </div>

      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
