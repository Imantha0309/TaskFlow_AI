# TaskFlow AI

A lightweight, AI-powered task manager built as a clean foundation rather than a
finished product. The current milestone delivers the application shell, routing,
authentication plumbing, a normalized Supabase service layer, the initial
database schema with Row Level Security, and an Edge Function scaffold.

> The AI features are intentionally not built yet. The foundation is designed so
> they can be added as a small number of well-isolated modules.

## Stack

| Layer      | Choice                                                      |
| ---------- | ----------------------------------------------------------- |
| UI         | React 19, React Router 7, CSS Modules, global design tokens |
| Build      | Vite 7, ESLint 9 (flat config), Prettier                    |
| Data/Auth  | Supabase (PostgreSQL, Auth, Realtime)                       |
| Server     | Supabase Edge Functions (Deno) for privileged operations    |
| Deployment | Vercel (frontend), Supabase (database + functions)          |

## What is included

- Responsive application shell: sticky header, desktop sidebar, mobile drawer,
  skip link, focus styles, and reduced-motion support.
- Lazy-loaded routes with Suspense fallbacks, a protected route, a 404 page, and
  a route error boundary.
- Supabase client configured from environment variables, with a friendly setup
  screen when credentials are missing.
- Centralized service layer (`apiClient`, `authService`, `tasksService`) that
  normalizes Supabase errors into a single `ApiError` type.
- Auth context that restores sessions, subscribes to auth changes, and exposes
  `signIn`, `signUp`, and `signOut`.
- Email/password login and sign-up screen.
- Dashboard that reads the user's tasks and demonstrates loading, empty, error,
  and populated states.
- Initial migration with `profiles`, `tasks`, indexes, `updated_at` triggers,
  profile bootstrap trigger, RLS policies, and Realtime publication.
- `health` Edge Function plus shared CORS, HTTP, and authenticated-client
  helpers for future secure operations.
- ESLint flat config and Prettier formatting.

## Project structure

```text
.
├─ .editorconfig
├─ .gitignore
├─ .prettierrc
├─ README.md
├─ frontend/
│  ├─ .env.example
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ vercel.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ assets/
│     ├─ components/
│     │  ├─ common/          # Button, Input, Badge, states, setup notice…
│     │  └─ layout/          # AppShell, Header, Sidebar, Footer, route gates…
│     ├─ context/            # AuthProvider + auth context
│     ├─ hooks/              # useAuth, useAsync
│     ├─ lib/                # env validation, Supabase client, helpers
│     ├─ pages/              # Dashboard, Login, NotFound
│     ├─ services/           # apiClient, authService, tasksService
│     ├─ styles/             # reset, tokens, global styles
│     ├─ App.jsx
│     ├─ main.jsx
│     └─ router.jsx
└─ supabase/
   ├─ functions/
   │  ├─ .env.example
   │  ├─ README.md
   │  ├─ _shared/            # CORS, HTTP helpers, Supabase clients
   │  └─ health/index.ts
   └─ migrations/
      └─ 20261108000000_initial_schema.sql
```

## Prerequisites

- Node.js **20.19+** (22.12+ recommended; developed on Node 24)
- npm 10+
- Optional: Supabase CLI 2.x and Docker for a local Supabase stack
- Optional: a Vercel account for deployment

## Quick start

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run dev
```

Open the printed URL (default <http://localhost:5173>).

If `.env` is empty or missing, the app still boots and renders a **setup notice**
instead of crashing. Fill in the Supabase values below to make it live.

### Available scripts

Run these inside `frontend/`:

| Script                 | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the Vite dev server                 |
| `npm run build`        | Production build to `frontend/dist`       |
| `npm run preview`      | Preview the production build locally      |
| `npm run lint`         | Lint all frontend source and config files |
| `npm run lint:fix`     | Lint and auto-fix                         |
| `npm run format`       | Format source with Prettier               |
| `npm run format:check` | Verify formatting without writing         |

## Environment variables

Vite only reads environment files from the `frontend/` directory and only
exposes variables prefixed with `VITE_`. Values are inlined into the browser
bundle, so they are public by design.

Create `frontend/.env` from `frontend/.env.example`:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

| Variable                 | Where to find it                                                   |
| ------------------------ | ------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Supabase dashboard → Project Settings → API → Project URL          |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon/publishable key |

Notes:

- `.env` and all `.env.*` files are ignored by Git; only `.env.example` is kept.
- Restart the dev server after changing env values.
- Never put the `service_role` key in a `VITE_*` variable. The client code
  validates the key shape and refuses to start the client if it detects a
  service-role JWT.
- On Vercel, add the same variables under **Project → Settings → Environment
  Variables** for Production and Preview.

## Supabase setup

### Option A — hosted project (fastest)

1. Create a project at <https://supabase.com/dashboard>.
2. Copy the Project URL and anon/publishable key into `frontend/.env`.
3. Apply the migration using one of these options:
   - **CLI (recommended):**
     ```bash
     supabase login
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```
   - **SQL editor:** open the Supabase SQL editor and run the full contents of
     `supabase/migrations/20261108000000_initial_schema.sql`.
4. In **Authentication → URL Configuration**, set the Site URL to your deployed
   URL (or `http://localhost:5173` while developing) and add both
   `http://localhost:5173/login` and `https://<your-app>.vercel.app/login` to the
   redirect allow list.
5. Decide how email confirmation should behave:
   - Keep it enabled for production. After sign-up, users confirm by email
     before signing in.
   - Disable it in **Authentication → Providers → Email** for quick local
     testing.
6. Restart `npm run dev`.

### Option B — local Supabase stack

Requires the Supabase CLI and Docker.

```bash
supabase init          # creates supabase/config.toml; keeps existing folders
supabase start
supabase db reset      # applies supabase/migrations/*
supabase status        # prints the local API URL and anon key
```

Put the printed URL (usually `http://127.0.0.1:54321`) and anon key into
`frontend/.env`, then restart Vite.

If `supabase init` reports that the project is already initialized, skip it.

### Schema overview

`public.profiles`

- One row per `auth.users` row, created automatically by the
  `handle_new_user()` trigger.
- Owners can read and update their own profile.

`public.tasks`

- `user_id` defaults to `auth.uid()` and references `auth.users`.
- `title` (1–200 chars), `description` (≤5000 chars), `status`
  (`todo | in_progress | done`), `priority` (`low | medium | high`), `due_date`,
  `completed_at`, timestamps.
- Indexed by `(user_id, status)` and `(user_id, due_date)`.
- RLS is enabled for select, insert, update, and delete; every policy checks
  `auth.uid() = user_id`.
- Added to the `supabase_realtime` publication when that publication exists.

Anonymous access is revoked; only `authenticated` and `service_role` have table
grants.

## Frontend architecture

```text
component ──▶ hook ──▶ service ──▶ lib/supabase ──▶ Supabase
```

- **Components never import `@supabase/supabase-js` directly.** They use hooks
  and services.
- `lib/env.js` validates configuration and exposes `isSupabaseConfigured`.
- `lib/supabase.js` creates the single browser client (or `null` when
  unconfigured).
- `services/apiClient.js` owns `ApiError`, request unwrapping, friendly error
  messages, and Edge Function invocation.
- `services/authService.js` owns session/auth calls.
- `services/tasksService.js` owns task reads/writes and only forwards writable
  fields; ownership is enforced by RLS, not by trusting client filters.
- `hooks/useAsync.js` drives loading/error/success state for pages.

### Adding a service

1. Create `frontend/src/services/<domain>Service.js`.
2. Import `getClient` and `run` from `./apiClient`.
3. Return plain data and let `run` throw normalized `ApiError`s.
4. Re-export from `frontend/src/services/index.js` if useful.

## Edge Functions

The sample `health` function confirms the runtime is deployed and reachable.

```bash
# Local (requires `supabase start`)
cp supabase/functions/.env.example supabase/functions/.env
supabase functions serve health --env-file ./supabase/functions/.env

# Deploy
supabase functions deploy health

# Optional: allow the browser origin explicitly
supabase secrets set ALLOWED_ORIGIN=https://your-app.vercel.app
```

Invoke it from the frontend through the shared helper:

```js
import { invokeFunction } from '@/services/apiClient'

const result = await invokeFunction('health', { method: 'GET' })
```

Shared helpers:

- `_shared/cors.ts` — CORS headers and preflight helper.
- `_shared/http.ts` — JSON responses and normalized HTTP errors.
- `_shared/supabase.ts` — user-scoped client, service-role client, and
  `requireUser()` JWT validation.

Privileged operations should call `requireUser(request)` before using the
service-role client, and must never return data the caller is not allowed to
see. See [`supabase/functions/README.md`](supabase/functions/README.md).

## Deployment to Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist` (defaults are correct).
4. Add the two `VITE_SUPABASE_*` environment variables for Production and
   Preview.
5. Deploy. `frontend/vercel.json` rewrites unknown paths to `index.html`, so
   React Router deep links work on refresh.
6. Add the Vercel domain to Supabase Auth **Site URL** and redirect allow list.
7. Deploy Edge Functions separately with `supabase functions deploy <name>`.

There is no root `package.json`; install and build from `frontend/`. This keeps
the Vercel configuration simple and avoids workspace resolution surprises.

## Security checklist

- The anon/publishable key is public. **RLS is the security boundary.**
- The service-role key lives only in Supabase Edge Function secrets or the local
  `supabase/functions/.env` file. It must never enter `frontend/` or a browser
  bundle.
- `.env*` files are ignored except `.env.example`; verify with `git status`
  before committing.
- The frontend warns in development if a service-role JWT or an `sb_secret_`
  key is used as the anon key.
- Edge Functions validate bearer tokens with `requireUser()` where required.
- Set `ALLOWED_ORIGIN` in production instead of relying on CORS wildcards.
- Rotate any key that was ever committed or exposed.
- Use HTTPS in production (Vercel and Supabase provide it by default).

## Troubleshooting

| Symptom                                       | Fix                                                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Setup notice instead of the app               | Create `frontend/.env` from `.env.example`, fill both values, restart `npm run dev`.                        |
| “The database schema is missing”              | Apply the migration (`supabase db push` or SQL editor).                                                     |
| “new row violates row-level security policy”  | Make sure you are signed in; tasks are scoped to `auth.uid()`.                                              |
| Login succeeds but redirects back to `/login` | Check Supabase Auth Site URL and redirect allow list; clear stale local storage for the site.               |
| Confirmation email never arrives              | Check the Supabase Auth email settings/logs; in local development, emails are captured by Inbucket/Mailpit. |
| CORS error when calling a function            | Set `ALLOWED_ORIGIN` to the exact frontend origin and redeploy the function.                                |
| Changes to `.env` are ignored                 | Vite reads env at startup; stop and restart the dev server.                                                 |

Verification commands:

```bash
cd frontend
npm run lint
npm run format:check
npm run build
```

## Next milestones

- Task create/edit/delete UI with optimistic updates.
- Realtime subscription hook for `tasks`.
- AI task breakdown through an authenticated Edge Function (rate-limited, with
  the model provider key stored as a server-side secret).
- Filtering, search, and keyboard shortcuts.
- Tests (Vitest + Testing Library) and CI.
