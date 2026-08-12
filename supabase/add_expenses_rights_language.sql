-- Adds: unlimited expense entries, rights-acknowledgment tracking, and a
-- persisted language preference. Safe to re-run.

alter table profiles add column if not exists rights_acknowledged boolean not null default false;
alter table profiles add column if not exists rights_acknowledged_at timestamptz;
alter table profiles add column if not exists language text not null default 'en';

create table if not exists expenses (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id) on delete cascade,
  label text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

drop policy if exists "own expenses select" on expenses;
drop policy if exists "own expenses insert" on expenses;
drop policy if exists "own expenses update" on expenses;
drop policy if exists "own expenses delete" on expenses;

create policy "own expenses select" on expenses for select
  using (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own expenses insert" on expenses for insert
  with check (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own expenses update" on expenses for update
  using (profile_id in (select id from profiles where user_id = auth.uid()));
create policy "own expenses delete" on expenses for delete
  using (profile_id in (select id from profiles where user_id = auth.uid()));

-- One-time migration: carry over any existing values from the old fixed
-- expense_* columns into the new expenses table, for profiles that don't
-- already have entries there. Safe to re-run (skips profiles already
-- migrated).
insert into expenses (profile_id, label, amount)
select p.id, v.label, v.amount
from profiles p
cross join lateral (values
  ('Rent / bond', p.expense_rent),
  ('Child support', p.expense_child_support),
  ('Loan repayments', p.expense_loan_repayments),
  ('Groceries', p.expense_groceries),
  ('Other', p.expense_other)
) as v(label, amount)
where v.amount > 0
  and not exists (select 1 from expenses e where e.profile_id = p.id);

-- The "Know Yourself" journey stage now points at its own dedicated page.
update journey_stages set href = '/know-yourself' where key = 'know-yourself';
