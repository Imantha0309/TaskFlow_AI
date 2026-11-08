import { getClient, run } from './apiClient'

const TABLE = 'tasks'
const TASK_COLUMNS =
  'id, user_id, title, description, status, priority, due_date, completed_at, created_at, updated_at'

/** Fields a client is allowed to write. Ownership is enforced by RLS. */
const WRITABLE_FIELDS = new Set([
  'title',
  'description',
  'status',
  'priority',
  'due_date',
  'completed_at',
])

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string | null} description
 * @property {'todo' | 'in_progress' | 'done'} status
 * @property {'low' | 'medium' | 'high'} priority
 * @property {string | null} due_date
 * @property {string | null} completed_at
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'completed_at'>>} TaskInput
 */

/**
 * @param {TaskInput} input
 * @returns {TaskInput}
 */
function pickWritableFields(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => WRITABLE_FIELDS.has(key) && value !== undefined)
  )
}

/**
 * Lists the signed-in user's tasks, newest first.
 *
 * @param {{ status?: Task['status'] }} [options]
 * @returns {Promise<Task[]>}
 */
export async function listTasks({ status } = {}) {
  let query = getClient().from(TABLE).select(TASK_COLUMNS).order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return run(query, { fallbackMessage: 'Your tasks could not be loaded.' })
}

/**
 * @param {string} id
 * @returns {Promise<Task | null>}
 */
export async function getTask(id) {
  return run(getClient().from(TABLE).select(TASK_COLUMNS).eq('id', id).maybeSingle(), {
    fallbackMessage: 'That task could not be loaded.',
  })
}

/**
 * Creates a task for the signed-in user. `user_id` defaults to `auth.uid()`
 * in the database, so it cannot be spoofed from the client.
 *
 * @param {TaskInput & { title: string }} input
 * @returns {Promise<Task>}
 */
export async function createTask(input) {
  return run(
    getClient().from(TABLE).insert(pickWritableFields(input)).select(TASK_COLUMNS).single(),
    { fallbackMessage: 'The task could not be created.' }
  )
}

/**
 * @param {string} id
 * @param {TaskInput} patch
 * @returns {Promise<Task>}
 */
export async function updateTask(id, patch) {
  return run(
    getClient()
      .from(TABLE)
      .update(pickWritableFields(patch))
      .eq('id', id)
      .select(TASK_COLUMNS)
      .single(),
    { fallbackMessage: 'The task could not be updated.' }
  )
}

/**
 * @param {string} id
 * @returns {Promise<null>}
 */
export async function deleteTask(id) {
  return run(getClient().from(TABLE).delete().eq('id', id), {
    fallbackMessage: 'The task could not be deleted.',
  })
}
