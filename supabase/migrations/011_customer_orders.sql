-- Pedidos desde el carrito (WhatsApp)
-- Ejecutar en Supabase → SQL Editor

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

notify pgrst, 'reload schema';
