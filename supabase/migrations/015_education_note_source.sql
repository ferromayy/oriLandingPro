-- Fuente opcional en notas de educación
-- Ejecutar en Supabase → SQL Editor

alter table public.education_notes
  add column if not exists source text not null default '';

notify pgrst, 'reload schema';
