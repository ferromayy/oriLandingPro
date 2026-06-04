-- URL opcional al contenido extendido del café (blog, artículo externo, etc.)

alter table public.coffees
  add column if not exists extended_content_url text not null default '';
