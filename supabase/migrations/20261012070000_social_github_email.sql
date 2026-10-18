-- GitHub and email links on a public profile.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column if not exists github_url text,
  add column if not exists email_url text;

alter table public.profiles drop constraint if exists github_url_format;
alter table public.profiles
  add constraint github_url_format check (
    github_url is null or (github_url ~ '^https://' and char_length(github_url) <= 200)
  );

alter table public.profiles drop constraint if exists email_url_format;
alter table public.profiles
  add constraint email_url_format check (
    email_url is null or (email_url ~ '^mailto:[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and char_length(email_url) <= 200)
  );
