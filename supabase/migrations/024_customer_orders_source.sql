-- Origen del pedido: cliente (WhatsApp) u operario (mostrador / admin).
alter table public.customer_orders
  add column if not exists source text not null default 'whatsapp';

alter table public.customer_orders
  drop constraint if exists customer_orders_source_check;

alter table public.customer_orders
  add constraint customer_orders_source_check
  check (source in ('whatsapp', 'staff'));

comment on column public.customer_orders.source is
  'whatsapp = pedido web/WhatsApp; staff = cargado por operario en admin';
