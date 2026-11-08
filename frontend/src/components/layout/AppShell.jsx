import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import styles from './AppShell.module.css'

export function AppShell() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePath, setActivePath] = useState(location.pathname)

  // Adjust derived state during render when navigation changes rather than in
  // an effect, so the drawer never flashes open on a new page.
  if (activePath !== location.pathname) {
    setActivePath(location.pathname)
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSidebarOpen])

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <div className={styles.layout}>
        <Sidebar open={isSidebarOpen} onNavigate={closeSidebar} />

        {isSidebarOpen ? (
          <button
            type="button"
            className={styles.backdrop}
            onClick={closeSidebar}
            aria-label="Close navigation"
          />
        ) : null}

        <div className={styles.content}>
          <main id="main-content" className={styles.main} tabIndex={-1}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
