-- Plan, expiry, and Dodo customer id. Run once in Supabase → SQL Editor.
-- A 1-Year Pass ends after one year. Owners cannot set these columns.

alter table public.profiles
  add column if not exists plan text,
  add column if not exists plan_expires_at timestamptz,
  add column if not exists dodo_customer_id text;

update public.profiles
set plan = 'early'
where paid_at is not null
  and plan is null;

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan is null or plan in ('early', 'year', 'lifetime'));

create or replace function private.protect_payment_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.paid_at = old.paid_at;
    new.dodo_payment_id = old.dodo_payment_id;
    new.plan = old.plan;
    new.plan_expires_at = old.plan_expires_at;
    new.dodo_customer_id = old.dodo_customer_id;
  end if;
  return new;
end;
$$;
