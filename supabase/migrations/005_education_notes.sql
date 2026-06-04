-- Notas de la sección Educación (ejecutar en Supabase → SQL Editor)

create table if not exists public.education_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists education_notes_active_sort_idx
  on public.education_notes (is_active, sort_order, created_at desc);

alter table public.education_notes enable row level security;

create policy "Notas de educación visibles públicamente"
  on public.education_notes for select
  using (is_active = true);
