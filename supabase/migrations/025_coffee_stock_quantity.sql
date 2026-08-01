-- Stock interno para operarios (no afecta la web pública).
alter table public.coffees
  add column if not exists stock_quantity integer not null default 0;

alter table public.coffees
  drop constraint if exists coffees_stock_quantity_check;

alter table public.coffees
  add constraint coffees_stock_quantity_check
  check (stock_quantity >= 0);

comment on column public.coffees.stock_quantity is
  'Cantidad en stock para uso interno del operario. No controla sold-out en la web.';

notify pgrst, 'reload schema';
