-- Amplía el límite de textos de eventos Academia de 30 a 60 caracteres.
alter table public.academia_events
  drop constraint if exists academia_events_title_len;

alter table public.academia_events
  drop constraint if exists academia_events_subtitle_len;

alter table public.academia_events
  add constraint academia_events_title_len
  check (char_length(title) <= 60);

alter table public.academia_events
  add constraint academia_events_subtitle_len
  check (char_length(subtitle) <= 60);

comment on table public.academia_events is
  'Eventos/cards de la sección Academia (imagen + título + subtítulo, máx. 60 caracteres c/u).';

notify pgrst, 'reload schema';
