-- Contenido en dos partes (antes y después de la imagen del medio)
alter table public.education_notes
  add column if not exists content_before_image text not null default '',
  add column if not exists content_after_image text not null default '';

update public.education_notes
set content_before_image = content
where content_before_image = ''
  and content <> '';

notify pgrst, 'reload schema';
