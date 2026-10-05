-- A short public description for each site (6 to 8 words).
-- Run once in Supabase → SQL Editor.

alter table public.sites
  add column description text not null default '';

alter table public.sites
  add constraint description_words check (
    description = ''
    or (
      char_length(description) <= 120
      and cardinality(regexp_split_to_array(btrim(description), '\s+')) between 6 and 8
    )
  );
