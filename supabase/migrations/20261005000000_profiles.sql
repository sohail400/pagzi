-- indie.site: profiles table, signup trigger, security rules and avatar storage.
-- Run once in Supabase → SQL Editor.

-- ---------------------------------------------------------------------------
-- 1. Profiles table (one row per user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  name text not null default '',
  bio text not null default '',
  location text not null default '',
  avatar_url text,
  x_url text,
  linkedin_url text,
  instagram_url text,
  show_website_name boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_format check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  constraint username_not_reserved check (
    username not in (
      'about', 'account', 'admin', 'api', 'app', 'auth', 'billing', 'blog', 'dashboard',
      'help', 'home', 'indie', 'indiesite', 'login', 'logout', 'pricing', 'privacy',
      'register', 'settings', 'signin', 'signup', 'sites', 'support', 'terms', 'www'
    )
  ),
  constraint name_length check (char_length(name) <= 80),
  constraint bio_length check (char_length(bio) <= 300),
  constraint location_length check (char_length(location) <= 80),
  constraint x_url_format check (x_url is null or (x_url ~ '^https://' and char_length(x_url) <= 200)),
  constraint linkedin_url_format check (linkedin_url is null or (linkedin_url ~ '^https://' and char_length(linkedin_url) <= 200)),
  constraint instagram_url_format check (instagram_url is null or (instagram_url ~ '^https://' and char_length(instagram_url) <= 200))
);

-- ---------------------------------------------------------------------------
-- 2. Helper functions live in a private schema (not reachable through the API)
-- ---------------------------------------------------------------------------
create schema if not exists private;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Create a profile automatically when someone signs up.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Create profiles for accounts that already exist.
insert into public.profiles (id, name)
select id, left(coalesce(raw_user_meta_data ->> 'name', ''), 80)
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security: anyone can read profiles, only the owner can edit
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- 4. Avatar storage: public images, users manage only their own folder
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Users can view their own avatar files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
