-- Estado del pedido: pendiente, finalizado o cancelado
-- Ejecutar en Supabase → SQL Editor

alter table public.customer_orders
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'completed', 'cancelled'));

create index if not exists customer_orders_status_idx
  on public.customer_orders (status);

notify pgrst, 'reload schema';
