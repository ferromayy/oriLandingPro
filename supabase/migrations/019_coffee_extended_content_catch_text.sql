-- Texto personalizado del bloque "Seguí leyendo" (vacío = plantilla predefinida)
alter table public.coffees
  add column if not exists extended_content_catch_text text not null default '';

notify pgrst, 'reload schema';
