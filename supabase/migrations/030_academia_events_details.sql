-- Suma duración y descripción a las cards de Academia.
alter table public.academia_events
  add column if not exists duration text not null default '';

alter table public.academia_events
  add column if not exists description text not null default '';

alter table public.academia_events
  drop constraint if exists academia_events_duration_len;

alter table public.academia_events
  add constraint academia_events_duration_len
  check (char_length(duration) <= 40);

alter table public.academia_events
  drop constraint if exists academia_events_description_len;

alter table public.academia_events
  add constraint academia_events_description_len
  check (char_length(description) <= 500);

-- Solo el taller de café en casa. El resto sigue con «Próximamente».
update public.academia_events
set
  subtitle = E'10/10/26\n1.ª edición — Baltus Cafetería (Nueva Córdoba)',
  duration = '3 horas',
  description = $desc$Un encuentro para aprender a leer el café antes de prepararlo.

Vamos a conocer qué hay detrás de cada grano: su origen, variedad, proceso y tueste.

También vamos a explorar qué encontramos en la taza y cómo pequeños cambios pueden transformar una preparación.

Sin recetas rígidas: aprender a observar, entender y preparar mejor.$desc$
where title = 'TALLER UN BUEN CAFÉ PARA TU CASA';

update public.academia_events
set
  description = $desc$* Cómo funciona la extracción: solución, soluto y solvente.
* Qué variables afectan la extracción.
* Tipos de extracción: ventajas y desventajas.
* Cómo analizar una taza y detectar qué está fallando.
* Cómo ajustar una receta según el sabor.
* TDS, % de extracción y flujo.
* Agua para café: dureza, alcalinidad y composición.
* Extracción uniforme y migración de finos.
* Cómo lograr mayor consistencia y repetibilidad en nuestros cafés.$desc$
where title like 'TALLER DE FILTRADOS AVANZADO%';

comment on table public.academia_events is
  'Eventos/cards de Academia: título, edición y lugar (máx. 60), duración (máx. 40) y descripción (máx. 500).';

notify pgrst, 'reload schema';
