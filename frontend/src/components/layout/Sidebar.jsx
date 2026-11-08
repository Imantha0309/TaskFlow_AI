import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { isSupabaseConfigured } from '@/lib/env'
import { cx } from '@/lib/cx'
import styles from './Sidebar.module.css'

const PLANNED_SECTIONS = ['Tasks', 'AI assistant', 'Settings']

function DashboardIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} [props.onNavigate]
 */
export function Sidebar({ open, onNavigate }) {
  return (
    <aside
      id="app-sidebar"
      className={cx(styles.sidebar, open && styles.open)}
      aria-label="Workspace navigation"
    >
      <nav aria-label="Primary">
        <p className={styles.sectionLabel}>Workspace</p>
        <ul role="list" className={styles.list}>
          <li>
            <NavLink
              to="/"
              end
              onClick={onNavigate}
              className={({ isActive }) => cx(styles.link, isActive && styles.active)}
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div>
        <p className={styles.sectionLabel}>Coming soon</p>
        <ul role="list" className={styles.list}>
          {PLANNED_SECTIONS.map((label) => (
            <li key={label} className={styles.planned}>
              <span>{label}</span>
              <Badge>Soon</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.status}>
        <span
          className={cx(styles.dot, isSupabaseConfigured ? styles.dotOk : styles.dotWarn)}
          aria-hidden="true"
        />
        <div>
          <p className={styles.statusTitle}>Supabase</p>
          <p className={styles.statusText}>
            {isSupabaseConfigured ? 'Configured' : 'Not configured'}
          </p>
        </div>
      </div>
    </aside>
  )
}
