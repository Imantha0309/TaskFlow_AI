import { cx } from '@/lib/cx'
import styles from './Button.module.css'

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} [props.variant]
 * @param {'sm' | 'md'} [props.size]
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.fullWidth]
 * @param {string} [props.className]
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
