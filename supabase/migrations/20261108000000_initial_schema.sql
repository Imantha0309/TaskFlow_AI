-- ============================================================================
-- TaskFlow AI — initial schema
-- ============================================================================
-- Creates the minimal data foundation for the app:
--   * profiles  — one row per authenticated user
--   * tasks     — user-owned tasks with Row Level Security
--
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL
-- editor of your project. Re-running is safe for the objects it manages.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public-facing profile data for each authenticated user.';

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_length check (char_length(title) between 1 and 200),
  constraint tasks_description_length check (description is null or char_length(description) <= 5000),
  constraint tasks_status_valid check (status in ('todo', 'in_progress', 'done')),
  constraint tasks_priority_valid check (priority in ('low', 'medium', 'high'))
);

comment on table public.tasks is 'Tasks owned by a single user. Access is enforced with RLS.';

create index if not exists tasks_user_id_status_idx
  on public.tasks (user_id, status);

create index if not exists tasks_user_id_due_date_idx
  on public.tasks (user_id, due_date)
  where due_date is not null;

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Profile bootstrap
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.tasks from anon;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant all on table public.profiles, public.tasks to service_role;

-- Profiles: owners can read and update their own row. Inserts happen through
-- the security-definer trigger above, so no insert policy is granted.
drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Tasks: every operation is scoped to the authenticated owner.
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own tasks" on public.tasks;
create policy "Users can create their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------------------
-- Add tasks to the realtime publication when it exists (hosted Supabase and
-- `supabase start` both create it). The guard keeps the migration repeatable.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'tasks'
     )
  then
    alter publication supabase_realtime add table public.tasks;
  end if;
end;
$$;
