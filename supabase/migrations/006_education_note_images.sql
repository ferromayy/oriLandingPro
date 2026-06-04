-- Imágenes opcionales para notas de educación (máx. 3 en el admin)
-- Ejecutar en Supabase → SQL Editor (después de 005_education_notes.sql)

create table if not exists public.education_note_images (
  id uuid primary key default gen_random_uuid(),
  education_note_id uuid not null references public.education_notes(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists education_note_images_note_idx
  on public.education_note_images (education_note_id, sort_order);

alter table public.education_note_images enable row level security;

create policy "Imágenes de notas activas"
  on public.education_note_images for select
  using (
    exists (
      select 1 from public.education_notes n
      where n.id = education_note_id and n.is_active = true
    )
  );
