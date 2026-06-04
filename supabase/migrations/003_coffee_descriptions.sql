-- Ejecuta en Supabase → SQL Editor (después de 002)

-- Renombra description → short_description y agrega long_description
alter table public.coffees rename column description to short_description;

alter table public.coffees
  add column if not exists long_description text not null default '';
