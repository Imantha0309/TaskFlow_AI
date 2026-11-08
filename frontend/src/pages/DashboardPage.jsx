import { useMemo } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, getDisplayName } from '@/lib/format'
import { listTasks } from '@/services/tasksService'
import styles from './DashboardPage.module.css'

const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

const STATUS_TONES = {
  todo: 'neutral',
  in_progress: 'primary',
  done: 'success',
}

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const PRIORITY_TONES = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
}

function StatCard({ label, value, hint }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statHint}>{hint}</p>
    </div>
  )
}

function TaskItem({ task }) {
  return (
    <li className={styles.task}>
      <div className={styles.taskCopy}>
        <p className={styles.taskTitle}>{task.title}</p>
        {task.description ? <p className={styles.taskDescription}>{task.description}</p> : null}
      </div>

      <div className={styles.taskMeta}>
        <Badge tone={STATUS_TONES[task.status] ?? 'neutral'}>{STATUS_LABELS[task.status]}</Badge>
        <Badge tone={PRIORITY_TONES[task.priority] ?? 'neutral'}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </Badge>
        {task.due_date ? (
          <span className={styles.dueDate}>Due {formatDate(task.due_date)}</span>
        ) : null}
      </div>
    </li>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    data: tasks,
    error,
    isLoading,
    isError,
    execute,
  } = useAsync(listTasks, {
    immediate: true,
  })

  const stats = useMemo(() => {
    const items = tasks ?? []

    return {
      total: items.length,
      todo: items.filter((task) => task.status === 'todo').length,
      inProgress: items.filter((task) => task.status === 'in_progress').length,
      done: items.filter((task) => task.status === 'done').length,
    }
  }, [tasks])

  const displayValue = isLoading ? '—' : undefined

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${getDisplayName(user)}`}
        description="This is the foundation of your workspace. Task creation, AI breakdowns, and realtime updates will plug into this shell."
        actions={
          <Button variant="secondary" onClick={() => execute()} isLoading={isLoading}>
            Refresh
          </Button>
        }
      />

      <section className={styles.stats} aria-label="Task summary">
        <StatCard
          label="Total tasks"
          value={displayValue ?? stats.total}
          hint="Everything in your workspace"
        />
        <StatCard label="To do" value={displayValue ?? stats.todo} hint="Waiting to be started" />
        <StatCard
          label="In progress"
          value={displayValue ?? stats.inProgress}
          hint="Currently in motion"
        />
        <StatCard label="Done" value={displayValue ?? stats.done} hint="Closed out" />
      </section>

      <section className={styles.panel} aria-labelledby="tasks-heading">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="tasks-heading" className={styles.panelTitle}>
              Your tasks
            </h2>
            <p className={styles.panelLead}>
              A live read from your Supabase <code>tasks</code> table.
            </p>
          </div>
          <span className={styles.count}>{isLoading ? 'Loading…' : `${stats.total} total`}</span>
        </div>

        <div className={styles.panelBody}>
          {isLoading ? <LoadingState message="Loading your tasks…" compact /> : null}

          {isError ? (
            <ErrorState
              title="We could not load your tasks"
              description={error?.message}
              onRetry={() => execute()}
            />
          ) : null}

          {!isLoading && !isError && stats.total === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Your workspace is ready. Task creation and AI-assisted planning arrive in the next milestone."
            />
          ) : null}

          {!isLoading && !isError && stats.total > 0 ? (
            <ul role="list" className={styles.taskList}>
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  )
}
