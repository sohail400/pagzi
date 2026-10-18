alter table public.profiles alter column page_color set default '#1F1F1F';

update public.profiles
set page_color = '#1F1F1F'
where upper(page_color) = '#F5F0E8';
