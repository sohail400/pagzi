-- Remember when the 1-Year Pass expiry email was sent. Run once in Supabase → SQL Editor.
-- Owners cannot set this column. A renewal clears it in application code.

alter table public.profiles
  add column if not exists year_expiry_email_sent_at timestamptz;

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
    new.year_expiry_email_sent_at = old.year_expiry_email_sent_at;
  end if;
  return new;
end;
$$;
