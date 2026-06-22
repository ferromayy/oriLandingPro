-- Imagen intercalada en el medio del texto de la nota
alter table public.education_note_images
  add column if not exists is_inline boolean not null default false;

notify pgrst, 'reload schema';
