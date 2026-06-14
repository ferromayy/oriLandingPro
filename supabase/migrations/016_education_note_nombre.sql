-- Nombre opcional en notas de educación (autor, referencia, etc.)
-- Ejecutar en Supabase → SQL Editor

alter table public.education_notes
  add column if not exists nombre text not null default '';

notify pgrst, 'reload schema';
