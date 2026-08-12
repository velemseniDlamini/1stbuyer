-- Add monthly expense breakdown so affordability is based on net income
-- minus real expenses, not gross income alone. Safe to re-run.
alter table profiles add column if not exists expense_rent numeric not null default 0;
alter table profiles add column if not exists expense_child_support numeric not null default 0;
alter table profiles add column if not exists expense_loan_repayments numeric not null default 0;
alter table profiles add column if not exists expense_groceries numeric not null default 0;
alter table profiles add column if not exists expense_other numeric not null default 0;
