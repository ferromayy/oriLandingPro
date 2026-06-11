-- Código público fijo (1600+) separado del nº de orden posicional (1, 2, 3…)
-- Ejecutar en Supabase → SQL Editor

alter table public.customer_orders
  add column if not exists order_code integer;

update public.customer_orders
set order_code = 1599 + order_number
where order_code is null;

alter table public.customer_orders
  alter column order_code set not null;

create unique index if not exists customer_orders_order_code_unique_idx
  on public.customer_orders (order_code);

-- El nº de orden lo asigna la app y se renumera al eliminar pedidos
alter table public.customer_orders
  alter column order_number drop default;

notify pgrst, 'reload schema';
