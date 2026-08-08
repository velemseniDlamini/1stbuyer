-- Add date of birth and license issue date so we can estimate finance rates
-- (age and license tenure affect real lender risk pricing). Safe to re-run.
alter table profiles add column if not exists date_of_birth date;
alter table profiles add column if not exists license_issued_date date;
