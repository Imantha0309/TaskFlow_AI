import { handleCorsPreflight } from '../_shared/cors.ts'
import { json } from '../_shared/http.ts'

/**
 * Public health check. Use it to confirm the function runtime is deployed and
 * reachable from the frontend.
 *
 * GET or POST /functions/v1/health
 */
Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight()
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Method not allowed.', code: 'method_not_allowed' }, 405)
  }

  return json({
    ok: true,
    service: 'taskflow-ai',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
})
