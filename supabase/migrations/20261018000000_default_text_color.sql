-- New pages start with black text so a light background stays readable.
-- Existing light pages that still use the old white default are updated.
-- Dark pages keep their light text.

alter table public.profiles alter column text_color set default '#1C1917';

update public.profiles
set text_color = '#1C1917'
where upper(text_color) = '#F5F5F4'
  and (
    get_byte(decode(substring(page_color from 2 for 2), 'hex'), 0) * 299
    + get_byte(decode(substring(page_color from 4 for 2), 'hex'), 0) * 587
    + get_byte(decode(substring(page_color from 6 for 2), 'hex'), 0) * 114
  ) / 1000 >= 150;
