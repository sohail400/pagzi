-- A page stays private until the owner clicks Publish.
-- Pages that already have a username stay online.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column if not exists published_at timestamptz;

update public.profiles
set published_at = coalesce(updated_at, created_at, now())
where username is not null
  and published_at is null;
