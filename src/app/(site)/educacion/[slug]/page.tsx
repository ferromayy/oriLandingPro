import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EducationNoteGallery,
  EducationNoteTitleWithImage,
} from "@/components/site/education-note-media";
import { EducationNoteContent } from "@/components/site/education-note-content";
import { getEducationNoteBySlug } from "@/lib/education/queries";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function EducacionNotePage({ params }: Props) {
  if (!EDUCATION_PUBLIC_ENABLED) notFound();

  const { slug } = await params;
  const note = await getEducationNoteBySlug(slug);

  if (!note) notFound();

  return (
    <main className="mx-auto w-full max-w-[58rem] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/educacion"
        className="mb-8 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Volver a Educación
      </Link>

      <article className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <EducationNoteTitleWithImage
          note={note}
          title={note.title}
          titleAs="h1"
        />

        <EducationNoteContent content={note.content} className="mt-6" />

        {(note.nombre?.trim() || note.source?.trim()) && (
          <div className="mt-8 space-y-1 border-t border-gray-100 pt-4 text-xs text-gray-400">
            {note.nombre?.trim() && <p>Nombre: {note.nombre.trim()}</p>}
            {note.source?.trim() && <p>Fuente: {note.source.trim()}</p>}
          </div>
        )}

        <EducationNoteGallery note={note} />
      </article>
    </main>
  );
}
