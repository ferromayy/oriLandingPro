-- Unifica el texto libre de `beneficio` a los procesos canónicos.
-- Honey y semi-lavado son el mismo proceso. TRIADA y cafés sin pista quedan vacíos.

update public.coffees
set beneficio = 'Natural anaeróbico'
where beneficio ~* 'anaerob';

update public.coffees
set beneficio = 'Honey / Semi-lavado'
where trim(beneficio) <> ''
  and (
    beneficio ~* 'honey'
    or beneficio ~* 'semi[[:space:]_-]*lavado'
  )
  and beneficio !~* 'anaerob';

update public.coffees
set beneficio = 'Lavado'
where trim(beneficio) <> ''
  and beneficio ~* 'lavado'
  and beneficio !~* 'semi'
  and beneficio !~* 'honey';

update public.coffees
set beneficio = 'Natural'
where trim(beneficio) <> ''
  and beneficio ~* 'natural'
  and beneficio !~* 'anaerob';

update public.coffees
set beneficio = 'Natural anaeróbico'
where trim(beneficio) = ''
  and name ~* 'anaerob';

update public.coffees
set beneficio = 'Honey / Semi-lavado'
where trim(beneficio) = ''
  and (
    name ~* 'honey'
    or name ~* 'semi[[:space:]_-]*lavado'
  );

update public.coffees
set beneficio = 'Lavado'
where trim(beneficio) = ''
  and name ~* 'lavado'
  and name !~* 'semi';

update public.coffees
set beneficio = 'Natural'
where trim(beneficio) = ''
  and name ~* 'natural'
  and name !~* 'anaerob';
