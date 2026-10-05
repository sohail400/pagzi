-- indie.site: Google Search Console connections, sites and daily traffic.
-- Run once in Supabase → SQL Editor.

-- ---------------------------------------------------------------------------
-- 1. Google connections (one per user). Holds the encrypted Google refresh
--    token, so only the server (using the secret key) may read or write it.
-- ---------------------------------------------------------------------------
create table public.google_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text not null default '',
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger google_connections_set_updated_at
  before update on public.google_connections
  for each row execute function private.set_updated_at();

-- RLS on with no policies = nobody can reach this table through the public API.
alter table public.google_connections enable row level security;
revoke all on public.google_connections from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Sites a user shows on their page (a Search Console property each).
--    Only the server adds sites, after checking the user owns them in Google.
-- ---------------------------------------------------------------------------
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  property text not null,
  name text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),

  constraint sites_user_property_unique unique (user_id, property),
  constraint property_length check (char_length(property) between 1 and 300),
  constraint name_length check (char_length(name) between 1 and 100)
);

alter table public.sites enable row level security;

create policy "Sites are viewable by everyone"
  on public.sites for select
  to anon, authenticated
  using (true);

create policy "Users can remove their own sites"
  on public.sites for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 3. Daily clicks and impressions per site (filled by the server).
-- ---------------------------------------------------------------------------
create table public.site_traffic_daily (
  site_id uuid not null references public.sites (id) on delete cascade,
  date date not null,
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  primary key (site_id, date)
);

alter table public.site_traffic_daily enable row level security;

create policy "Traffic is viewable by everyone"
  on public.site_traffic_daily for select
  to anon, authenticated
  using (true);
