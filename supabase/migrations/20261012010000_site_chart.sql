-- Chart style for each site's public traffic card. Area is the default.
-- Run once in Supabase → SQL Editor.

alter table public.sites
  add column if not exists chart text not null default 'area';

alter table public.sites drop constraint if exists site_chart;
alter table public.sites
  add constraint site_chart check (chart in ('area', 'line', 'bar', 'combined'));
