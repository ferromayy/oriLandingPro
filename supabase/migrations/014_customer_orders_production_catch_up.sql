-- Ejecutar en Supabase de PRODUCCIÓN (SQL Editor) si el checkout falla por order_code o status.
-- Es idempotente: se puede correr aunque ya hayas aplicado migraciones parciales.

-- Tabla base (por si 011 nunca se corrió)
create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial not null unique,
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0 check (total >= 0),
  whatsapp_message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists customer_orders_created_at_idx
  on public.customer_orders (created_at desc);

-- Estado (012)
alter table public.customer_orders
  add column if not exists status text not null default 'pending';

alter table public.customer_orders
  drop constraint if exists customer_orders_status_check;

alter table public.customer_orders
  add constraint customer_orders_status_check
  check (status in ('pending', 'completed', 'cancelled'));

create index if not exists customer_orders_status_idx
  on public.customer_orders (status);

-- Código público fijo (013)
alter table public.customer_orders
  add column if not exists order_code integer;

update public.customer_orders
set order_code = 1599 + order_number
where order_code is null;

alter table public.customer_orders
  alter column order_code set not null;

create unique index if not exists customer_orders_order_code_unique_idx
  on public.customer_orders (order_code);

alter table public.customer_orders
  alter column order_number drop default;

notify pgrst, 'reload schema';
