-- AutoGuard SA — move from a single shared demo profile to real per-user
-- accounts backed by Supabase Auth. Run this in the SQL Editor AFTER
-- schema.sql. Safe to re-run.

-- 1. Link profiles to auth.users
alter table profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
create unique index if not exists profiles_user_id_key on profiles (user_id);

-- The old seeded "Thabo Mokoena" demo row has no user_id and is no longer
-- reachable by the app (every query now filters by user_id = auth.uid()).
-- Delete it so it doesn't linger as orphaned data:
delete from profiles where user_id is null;

-- 2. Tighten RLS: each user can only see/edit their own profile
drop policy if exists "public read" on profiles;
drop policy if exists "own profile select" on profiles;
drop policy if exists "own profile insert" on profiles;
drop policy if exists "own profile update" on profiles;

create policy "own profile select" on profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on profiles for update using (auth.uid() = user_id);

-- 3. Tighten RLS on per-profile tables: only reachable via an owned profile
drop policy if exists "public read" on credit_history;
drop policy if exists "own credit_history select" on credit_history;
drop policy if exists "own credit_history insert" on credit_history;
create policy "own credit_history select" on credit_history for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own credit_history insert" on credit_history for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

drop policy if exists "public read" on documents;
drop policy if exists "own documents select" on documents;
drop policy if exists "own documents insert" on documents;
drop policy if exists "own documents update" on documents;
create policy "own documents select" on documents for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own documents insert" on documents for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own documents update" on documents for update
  using (profile_id in (select id from profiles where user_id = auth.uid()));

drop policy if exists "public read" on quotations;
drop policy if exists "own quotations select" on quotations;
drop policy if exists "own quotations insert" on quotations;
create policy "own quotations select" on quotations for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own quotations insert" on quotations for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));

-- 4. Shared catalog/reference data stays public-read for every signed-in user
-- (dealers, cars, insurance_providers, journey_stages, tips) — no change needed,
-- their "public read" policies from schema.sql already cover this correctly.

-- 5. Buying goal wasn't realistic — not everyone is a first-time buyer or
-- trading in a vehicle. Widen the allowed values.
alter table profiles drop constraint if exists profiles_buying_goal_check;
alter table profiles add constraint profiles_buying_goal_check
  check (buying_goal in ('first-time', 'trade-in', 'replacing', 'additional', 'browsing'));
