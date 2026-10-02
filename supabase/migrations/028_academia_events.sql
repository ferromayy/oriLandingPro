-- Eventos de Academia (imagen + dos textos cortos).
create table if not exists public.academia_events (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null,
  subtitle text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academia_events_title_len check (char_length(title) <= 30),
  constraint academia_events_subtitle_len check (char_length(subtitle) <= 30)
);

create index if not exists academia_events_active_sort_idx
  on public.academia_events (is_active, sort_order, created_at desc);

alter table public.academia_events enable row level security;

drop policy if exists "Eventos de academia visibles públicamente"
  on public.academia_events;

create policy "Eventos de academia visibles públicamente"
  on public.academia_events for select
  using (is_active = true);

comment on table public.academia_events is
  'Eventos/cards de la sección Academia (imagen + título + subtítulo, máx. 30 caracteres c/u).';

notify pgrst, 'reload schema';
