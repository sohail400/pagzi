-- indie.site: add a YouTube link to profiles.
-- Run once in Supabase → SQL Editor.

alter table public.profiles
  add column youtube_url text,
  add constraint youtube_url_format check (
    youtube_url is null or (youtube_url ~ '^https://' and char_length(youtube_url) <= 200)
  );
