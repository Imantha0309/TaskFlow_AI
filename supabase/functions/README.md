# Supabase Edge Functions

Edge Functions run on Deno and are the only place that may use privileged
credentials. Keep model-provider keys, the service-role key, and any secret
logic here.

## Layout

```text
functions/
├─ .env.example              # local-only secrets template
├─ _shared/
│  ├─ cors.ts                # CORS headers + preflight helper
│  ├─ http.ts                # json(), HttpError, handleError()
│  └─ supabase.ts            # user client, service client, requireUser()
└─ health/
   └─ index.ts               # public runtime check
```

## Local development

```bash
# From the repository root
cp supabase/functions/.env.example supabase/functions/.env
# Fill in local values; `supabase status` prints the local URL and keys.

supabase functions serve health --env-file ./supabase/functions/.env
```

The function is then available at:

```text
http://127.0.0.1:54321/functions/v1/health
```

Test it with the anon key:

```bash
curl -i http://127.0.0.1:54321/functions/v1/health \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

## Deployment

```bash
supabase functions deploy health
```

Hosted projects provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to functions automatically. Add any application
secrets explicitly:

```bash
supabase secrets set ALLOWED_ORIGIN=https://your-app.vercel.app
supabase secrets set AI_PROVIDER_API_KEY=...
```

Never commit `supabase/functions/.env` or put a service-role key in the
frontend.

## Writing a secure function

```ts
import { handleCorsPreflight } from '../_shared/cors.ts'
import { handleError, json } from '../_shared/http.ts'
import { requireUser } from '../_shared/supabase.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return handleCorsPreflight()

  try {
    const { user, supabase } = await requireUser(request)
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('user_id', user.id)

    if (error) throw error

    return json({ tasks: data })
  } catch (error) {
    return handleError(error)
  }
})
```

Guidelines:

- Call `requireUser()` for anything user-specific; it validates the bearer
  token against Supabase Auth.
- Prefer the user-scoped client so RLS still applies. Reach for
  `createServiceClient()` only when a legitimate operation cannot be expressed
  through RLS, and validate authorization yourself first.
- Keep request bodies small and validate input before writing.
- Rate-limit expensive AI calls and never trust client-supplied user IDs.
- Set `ALLOWED_ORIGIN` in production instead of allowing every origin.
- Return stable `{ error, code }` JSON shapes; the frontend's `invokeFunction`
  helper surfaces them as `ApiError`.
