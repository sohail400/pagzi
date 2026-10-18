-- Per-site logo, category, status, and anonymous public cards.
-- Run once in Supabase → SQL Editor.

alter table public.sites drop constraint if exists description_words;

alter table public.sites
  add column if not exists anonymous boolean not null default false,
  add column if not exists logo_url text not null default '',
  add column if not exists category text not null default '',
  add column if not exists status text not null default '',
  add column if not exists show_status boolean not null default false;

alter table public.sites drop constraint if exists description_length;
alter table public.sites
  add constraint description_length check (
    description = ''
    or (
      char_length(description) <= 200
      and cardinality(regexp_split_to_array(btrim(description), '\s+')) >= 6
    )
  );

alter table public.sites drop constraint if exists site_category;
alter table public.sites
  add constraint site_category check (
    category in (
      '',
      'Artificial Intelligence',
      'Productivity',
      'Education',
      'No Code',
      'Social Media',
      'E-Commerce',
      'Analytics',
      'Web 3',
      'Design Tools',
      'Developer Tools',
      'Marketing',
      'Finance',
      'Others'
    )
  );

alter table public.sites drop constraint if exists site_status;
alter table public.sites
  add constraint site_status check (
    status in ('', 'Building...', 'Active', 'On hold', 'For Sale', 'Acquired', 'Discontinued')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-logos', 'site-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
