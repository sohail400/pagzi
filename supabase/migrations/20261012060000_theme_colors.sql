-- Live page theme: text color and share button color, saved with the page background.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column if not exists text_color text not null default '#F5F5F4',
  add column if not exists share_color text not null default '#E7E5E4';

alter table public.profiles drop constraint if exists text_color_hex;
alter table public.profiles
  add constraint text_color_hex check (text_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles drop constraint if exists share_color_hex;
alter table public.profiles
  add constraint share_color_hex check (share_color ~ '^#[0-9A-Fa-f]{6}$');
