-- Lets a user actually choose a car, which is what moves the buyer journey
-- forward past "Find Your Car". No FK constraint since cars is shared
-- catalog data that can be replaced independently of profiles. Safe to re-run.
alter table profiles add column if not exists selected_car_id text;
