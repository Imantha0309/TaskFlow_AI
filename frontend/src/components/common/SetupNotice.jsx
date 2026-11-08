import { envIssues } from '@/lib/env'
import styles from './SetupNotice.module.css'

/**
 * Rendered instead of data-driven UI when Supabase credentials are missing.
 * Keeps the app usable for design work without faking a connection.
 */
export function SetupNotice() {
  return (
    <section className={styles.notice} aria-labelledby="setup-title">
      <p className={styles.badge}>Setup required</p>

      <div className={styles.intro}>
        <h1 id="setup-title" className={styles.title}>
          Connect your Supabase project
        </h1>
        <p className={styles.lead}>
          TaskFlow AI is running, but it has no Supabase credentials yet. Add them once and the
          entire app becomes live.
        </p>
      </div>

      {envIssues.length > 0 ? (
        <ul className={styles.issues} aria-label="Configuration issues">
          {envIssues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}

      <ol className={styles.steps}>
        <li>
          <strong>Create a Supabase project.</strong> Copy the project URL and the anon
          (publishable) key from the project&apos;s API settings.
        </li>
        <li>
          <strong>Create your local env file.</strong>
          <pre className={styles.code}>
            <code>
              cd frontend{'\n'}
              copy .env.example .env{'\n'}
              {'\n'}# macOS / Linux{'\n'}
              cp .env.example .env
            </code>
          </pre>
        </li>
        <li>
          <strong>Fill in the values.</strong> Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server so Vite picks them up.
        </li>
        <li>
          <strong>Apply the database migration.</strong> See the README for the Supabase CLI and SQL
          editor instructions.
        </li>
      </ol>

      <div className={styles.warning} role="note">
        <strong>Keep secrets server-side.</strong> Only the anon/publishable key belongs in the
        browser. The service_role key must live in Edge Function secrets, never in a{' '}
        <code>VITE_*</code> variable.
      </div>

      <a
        className={styles.link}
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noreferrer"
      >
        Open the Supabase dashboard
        <span aria-hidden="true"> ↗</span>
      </a>
    </section>
  )
}
