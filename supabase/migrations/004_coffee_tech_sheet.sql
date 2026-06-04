-- Ficha técnica y datos del detalle de producto
alter table public.coffees add column if not exists origin text not null default '';
alter table public.coffees add column if not exists varietal text not null default '';
alter table public.coffees add column if not exists beneficio text not null default '';
alter table public.coffees add column if not exists altitude text not null default '';
