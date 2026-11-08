import { LoadingState } from '@/components/common/LoadingState'
import { cx } from '@/lib/cx'
import styles from './RouteLoading.module.css'

/**
 * @param {object} props
 * @param {boolean} [props.fullHeight]
 */
export function RouteLoading({ fullHeight = false }) {
  return (
    <div className={cx(styles.page, fullHeight && styles.fullHeight)}>
      <LoadingState message="Loading…" compact />
    </div>
  )
}
