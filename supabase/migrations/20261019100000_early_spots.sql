-- Early $9 spots. Run once in Supabase → SQL Editor.
-- People who already paid count as Early. Owners cannot set their own plan.

alter table public.profiles
  add column if not exists plan text;

update public.profiles
set plan = 'early'
where paid_at is not null
  and plan is null;

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
  end if;
  return new;
end;
$$;
