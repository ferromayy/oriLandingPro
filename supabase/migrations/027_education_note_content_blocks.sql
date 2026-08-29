-- Bloques de contenido flexibles (párrafos con texto + 0–3 imágenes).
alter table public.education_notes
  add column if not exists content_blocks jsonb not null default '[]'::jsonb;

comment on column public.education_notes.content_blocks is
  'Array de párrafos: [{ "text": "...", "images": ["url", ...] }]. Máx. 10 párrafos, 0–3 imágenes c/u.';

notify pgrst, 'reload schema';
