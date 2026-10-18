-- Allow the extra fonts shown in the style picker.
-- Run once in Supabase → SQL Editor.

alter table public.profiles drop constraint if exists font_style_choice;
alter table public.profiles
  add constraint font_style_choice check (
    font_style in (
      'inter', 'outfit', 'space', 'dm', 'poppins', 'nunito',
      'fraunces', 'playfair', 'lora', 'newsreader', 'plex', 'caveat'
    )
  );
