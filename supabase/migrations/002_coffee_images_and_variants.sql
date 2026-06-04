-- Ejecuta en Supabase → SQL Editor (después de 001_coffees.sql)

-- Imágenes (3 a 6 por café, una principal)
create table if not exists public.coffee_images (
  id uuid primary key default gen_random_uuid(),
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists coffee_images_coffee_idx
  on public.coffee_images (coffee_id, sort_order);

-- Variantes por tamaño: 150g, 250g, 500g
create table if not exists public.coffee_variants (
  id uuid primary key default gen_random_uuid(),
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  size_grams integer not null check (size_grams in (150, 250, 500)),
  price integer not null check (price >= 0),
  is_available boolean not null default true,
  unique (coffee_id, size_grams)
);

create index if not exists coffee_variants_coffee_idx
  on public.coffee_variants (coffee_id, size_grams);

-- Migrar datos existentes (si vienen de 001)
insert into public.coffee_images (coffee_id, url, is_primary, sort_order)
select c.id, c.image_url, true, 0
from public.coffees c
where c.image_url is not null
  and not exists (
    select 1 from public.coffee_images ci where ci.coffee_id = c.id
  );

insert into public.coffee_variants (coffee_id, size_grams, price, is_available)
select c.id, 250, c.price_250g, not c.sold_out
from public.coffees c
where c.price_250g is not null
  and not exists (
    select 1 from public.coffee_variants cv
    where cv.coffee_id = c.id and cv.size_grams = 250
  );

insert into public.coffee_variants (coffee_id, size_grams, price, is_available)
select c.id, 500, c.price_1000g, not c.sold_out
from public.coffees c
where c.price_1000g is not null
  and not exists (
    select 1 from public.coffee_variants cv
    where cv.coffee_id = c.id and cv.size_grams = 500
  );

-- Quitar columnas legacy
alter table public.coffees drop column if exists price_250g;
alter table public.coffees drop column if exists price_1000g;
alter table public.coffees drop column if exists image_url;
alter table public.coffees drop column if exists sold_out;

-- RLS
alter table public.coffee_images enable row level security;
alter table public.coffee_variants enable row level security;

create policy "Imágenes de cafés activos"
  on public.coffee_images for select
  using (
    exists (
      select 1 from public.coffees c
      where c.id = coffee_id and c.is_active = true
    )
  );

create policy "Variantes de cafés activos"
  on public.coffee_variants for select
  using (
    exists (
      select 1 from public.coffees c
      where c.id = coffee_id and c.is_active = true
    )
  );

-- Asegurar variantes 150g vacías con precio 0 para cafés existentes (admin las completa)
insert into public.coffee_variants (coffee_id, size_grams, price, is_available)
select c.id, 150, 0, false
from public.coffees c
where not exists (
  select 1 from public.coffee_variants cv
  where cv.coffee_id = c.id and cv.size_grams = 150
);

insert into public.coffee_variants (coffee_id, size_grams, price, is_available)
select c.id, 500, 0, false
from public.coffees c
where not exists (
  select 1 from public.coffee_variants cv
  where cv.coffee_id = c.id and cv.size_grams = 500
);
