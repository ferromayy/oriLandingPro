-- Ejecuta esto en Supabase → SQL Editor

create table if not exists public.coffees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  codename text,
  tasting_notes text not null default '',
  description text not null default '',
  price_250g integer not null check (price_250g >= 0),
  price_1000g integer check (price_1000g is null or price_1000g >= 0),
  image_url text,
  sold_out boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coffees_active_sort_idx
  on public.coffees (is_active, sort_order, created_at desc);

alter table public.coffees enable row level security;

create policy "Cafés visibles públicamente"
  on public.coffees for select
  using (is_active = true);

-- Datos iniciales (imágenes en /public/images/products)
insert into public.coffees (name, slug, codename, tasting_notes, price_250g, image_url, sold_out, sort_order)
values
  (
    'Brasil - Natural',
    'brasil',
    'FRUTO',
    'Chocolate amargo, cáscara de naranja y frutado',
    23000,
    '/images/products/fruto.png',
    false,
    1
  ),
  (
    'COLOMBIA - HONEY',
    'mucilago',
    'MUCILAGO',
    'Jazmín, Limoncillo, Panela, Azúcar mascabo',
    30000,
    '/images/products/mucilago.png',
    false,
    2
  ),
  (
    'Colombia - Lavado',
    'colombia',
    'SEMILLA',
    'Naranja, Manzana roja, Caramelo',
    28000,
    '/images/products/semilla.png',
    true,
    3
  ),
  (
    'Uganda - Natural anaeróbico',
    'uganda',
    'FERMENTO',
    'Frutilla, frambuesa, ciruela, almíbar y avinado',
    35000,
    '/images/products/fermento.png',
    false,
    4
  ),
  (
    'TRIADA - DEGUSTACIÓN',
    'triada',
    'TRIADA',
    'Experiencia sensorial de nuestros tres tipos de granos',
    40000,
    '/images/products/triada.png',
    true,
    5
  )
on conflict (slug) do nothing;

-- Storage para imágenes subidas desde el admin (opcional)
insert into storage.buckets (id, name, public)
values ('coffee-images', 'coffee-images', true)
on conflict (id) do nothing;

create policy "Imágenes de café públicas"
  on storage.objects for select
  using (bucket_id = 'coffee-images');

create policy "Service role gestiona imágenes"
  on storage.objects for all
  using (bucket_id = 'coffee-images')
  with check (bucket_id = 'coffee-images');
