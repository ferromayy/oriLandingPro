-- Ejecutá esto en Supabase → SQL Editor si ves errores como
-- "Could not find the 'altitude' column of 'coffees' in the schema cache"
-- (cubre migraciones 003, 004 y 007 que quizás no corriste)

-- 003: descripciones corta / larga
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'coffees'
      and column_name = 'description'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'coffees'
      and column_name = 'short_description'
  ) then
    alter table public.coffees rename column description to short_description;
  end if;
end $$;

alter table public.coffees
  add column if not exists short_description text not null default '';

alter table public.coffees
  add column if not exists long_description text not null default '';

-- 004: ficha técnica
alter table public.coffees add column if not exists origin text not null default '';
alter table public.coffees add column if not exists varietal text not null default '';
alter table public.coffees add column if not exists beneficio text not null default '';
alter table public.coffees add column if not exists altitude text not null default '';

-- 007: URL contenido extendido
alter table public.coffees
  add column if not exists extended_content_url text not null default '';

-- Refrescar caché de PostgREST (Supabase)
notify pgrst, 'reload schema';
