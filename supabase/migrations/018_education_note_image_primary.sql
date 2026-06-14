-- Imagen principal en notas de educación
-- Ejecutar en Supabase → SQL Editor

alter table public.education_note_images
  add column if not exists is_primary boolean not null default false;

update public.education_note_images i
set is_primary = true
from (
  select distinct on (education_note_id) id
  from public.education_note_images
  order by education_note_id, sort_order asc, created_at asc
) first_image
where i.id = first_image.id
  and not exists (
    select 1
    from public.education_note_images existing
    where existing.education_note_id = i.education_note_id
      and existing.is_primary = true
  );

notify pgrst, 'reload schema';
