-- Optional custom domain for a public page.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column if not exists custom_domain text;

alter table public.profiles drop constraint if exists custom_domain_format;
alter table public.profiles
  add constraint custom_domain_format check (
    custom_domain is null
    or custom_domain ~ '^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$'
  );

create unique index if not exists profiles_custom_domain_key
  on public.profiles (custom_domain);
