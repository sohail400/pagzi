-- Public page style: chart colors, font, and backgrounds.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column if not exists chart_clicks text not null default '#2563EB',
  add column if not exists chart_impressions text not null default '#F97316',
  add column if not exists font_style text not null default 'inter',
  add column if not exists card_color text not null default '#FFFFFF',
  add column if not exists page_color text not null default '#F5F0E8';

alter table public.profiles drop constraint if exists chart_clicks_hex;
alter table public.profiles
  add constraint chart_clicks_hex check (chart_clicks ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles drop constraint if exists chart_impressions_hex;
alter table public.profiles
  add constraint chart_impressions_hex check (chart_impressions ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles drop constraint if exists card_color_hex;
alter table public.profiles
  add constraint card_color_hex check (card_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles drop constraint if exists page_color_hex;
alter table public.profiles
  add constraint page_color_hex check (page_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles drop constraint if exists font_style_choice;
alter table public.profiles
  add constraint font_style_choice check (font_style in ('inter', 'outfit', 'space', 'dm', 'poppins', 'nunito', 'fraunces', 'playfair', 'lora', 'newsreader', 'plex', 'caveat'));
