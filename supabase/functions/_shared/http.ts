import { corsHeaders } from './cors.ts'

/** Returns a JSON response with the shared CORS headers. */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

/** Error type that maps cleanly to an HTTP response. */
export class HttpError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, message: string, code = 'request_error') {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

/**
 * Converts thrown values into JSON errors. Unexpected errors are logged and
 * never leak implementation details to the client.
 */
export function handleError(error: unknown): Response {
  if (error instanceof HttpError) {
    return json({ error: error.message, code: error.code }, error.status)
  }

  console.error('[TaskFlow AI] Unhandled Edge Function error:', error)
  return json({ error: 'Unexpected server error.', code: 'internal_error' }, 500)
}
