-- Analytics for the hidden admin stats page: real signup dates, login
-- events, and session-length heartbeats. Nothing here is readable by
-- normal users — RLS restricts every table to the owning row, and the
-- admin page reads through the service-role key instead, server-side only.

alter table profiles add column if not exists created_at timestamptz not null default now();

create table if not exists login_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table login_events enable row level security;
drop policy if exists "own login_events insert" on login_events;
create policy "own login_events insert" on login_events for insert
  with check (auth.uid() = user_id);
drop policy if exists "own login_events select" on login_events;
create policy "own login_events select" on login_events for select
  using (auth.uid() = user_id);

-- One row per browser session, upserted by a client-side heartbeat every
-- ~60s while the app tab is visible. Session length = last_seen_at - started_at.
create table if not exists sessions (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table sessions enable row level security;
drop policy if exists "own sessions insert" on sessions;
create policy "own sessions insert" on sessions for insert
  with check (auth.uid() = user_id);
drop policy if exists "own sessions update" on sessions;
create policy "own sessions update" on sessions for update
  using (auth.uid() = user_id);
drop policy if exists "own sessions select" on sessions;
create policy "own sessions select" on sessions for select
  using (auth.uid() = user_id);
