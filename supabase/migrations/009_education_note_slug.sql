-- Slug para URLs estables: /educacion/[slug]

alter table public.education_notes
  add column if not exists slug text;

update public.education_notes
set slug = trim(both '-' from lower(
  regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  )
))
where slug is null or trim(slug) = '';

update public.education_notes
set slug = 'nota-' || substring(id::text, 1, 8)
where slug is null or trim(slug) = '';

with duplicates as (
  select
    id,
    slug,
    row_number() over (partition by slug order by created_at) as row_num
  from public.education_notes
)
update public.education_notes as notes
set slug = notes.slug || '-' || duplicates.row_num
from duplicates
where notes.id = duplicates.id
  and duplicates.row_num > 1;

alter table public.education_notes
  alter column slug set not null;

create unique index if not exists education_notes_slug_key
  on public.education_notes (slug);

notify pgrst, 'reload schema';
