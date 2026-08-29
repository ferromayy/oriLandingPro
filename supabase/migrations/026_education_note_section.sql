-- Sección de Educación: Blog vs Prepará en casa (recetas de métodos).
alter table public.education_notes
  add column if not exists section text not null default 'blog';

alter table public.education_notes
  drop constraint if exists education_notes_section_check;

alter table public.education_notes
  add constraint education_notes_section_check
  check (section in ('blog', 'prepara_en_casa'));

create index if not exists education_notes_section_active_sort_idx
  on public.education_notes (section, is_active, sort_order);

comment on column public.education_notes.section is
  'blog = notas del blog; prepara_en_casa = recetas base de métodos';

notify pgrst, 'reload schema';
