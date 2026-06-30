-- Productor en ficha técnica del café (opcional)
alter table public.coffees
  add column if not exists producer text not null default '';

notify pgrst, 'reload schema';
