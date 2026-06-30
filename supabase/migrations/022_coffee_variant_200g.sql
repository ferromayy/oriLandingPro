-- Tamaño 200g en variantes de café

alter table public.coffee_variants
  drop constraint if exists coffee_variants_size_grams_check;

alter table public.coffee_variants
  add constraint coffee_variants_size_grams_check
  check (size_grams in (150, 200, 250, 500, 1000));

insert into public.coffee_variants (coffee_id, size_grams, price, is_available)
select c.id, 200, 0, false
from public.coffees c
where not exists (
  select 1
  from public.coffee_variants cv
  where cv.coffee_id = c.id and cv.size_grams = 200
);

notify pgrst, 'reload schema';
