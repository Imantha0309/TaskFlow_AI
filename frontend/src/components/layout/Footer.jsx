import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>© {new Date().getFullYear()} TaskFlow AI</p>
      <p className={styles.meta}>React · Supabase · Vite</p>
    </footer>
  )
}
