/**
 * CORS headers shared by all Edge Functions.
 *
 * `ALLOWED_ORIGIN` is optional. Set it in production (for example to your
 * Vercel URL) instead of relying on the wildcard default. Once credentials or
 * cookies are used, a wildcard origin is no longer acceptable.
 */
const configuredOrigin = Deno.env.get('ALLOWED_ORIGIN')?.trim()

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': configuredOrigin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  Vary: 'Origin',
}

/** Preflight response helper. */
export function handleCorsPreflight(): Response {
  return new Response('ok', { headers: corsHeaders })
}
