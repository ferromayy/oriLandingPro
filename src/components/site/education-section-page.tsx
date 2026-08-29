import Link from "next/link";
import { EducationNotesList } from "@/components/site/education-notes-list";
import {
  EDUCATION_SECTION_META,
  type EducationSection,
} from "@/lib/education/sections";
import type { EducationNote } from "@/lib/education/types";

type Props = {
  section: EducationSection;
  notes: EducationNote[];
};

export function EducationSectionPage({ section, notes }: Props) {
  const meta = EDUCATION_SECTION_META[section];
  const readLabel =
    section === "prepara_en_casa" ? "Ver receta completa" : "Leer nota completa";

  return (
    <main className="mx-auto w-full max-w-[58rem] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/educacion"
        className="mb-8 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Educación
      </Link>

      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">{meta.description}</p>
      </section>

      <EducationNotesList
        notes={notes}
        emptyMessage={meta.emptyMessage}
        readLabel={readLabel}
      />

      <p className="mt-10 text-center text-sm text-gray-500">
        ¿Querés probar nuestros cafés?{" "}
        <Link href="/cafe" className="font-medium text-gray-900 underline">
          Ver catálogo
        </Link>
      </p>
    </main>
  );
}
