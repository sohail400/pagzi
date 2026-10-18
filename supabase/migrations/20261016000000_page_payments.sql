-- One-time page payments. Run once in Supabase → SQL Editor.
-- Owners cannot mark themselves paid. Only the server (secret key) can.

create schema if not exists private;

alter table public.profiles
  add column if not exists paid_at timestamptz,
  add column if not exists dodo_payment_id text;

create unique index if not exists profiles_dodo_payment_id_key
  on public.profiles (dodo_payment_id);

create or replace function private.protect_payment_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.paid_at = old.paid_at;
    new.dodo_payment_id = old.dodo_payment_id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_payment_columns on public.profiles;

create trigger profiles_protect_payment_columns
  before update on public.profiles
  for each row execute function private.protect_payment_columns();
