import Link from "next/link";
import { notFound } from "next/navigation";
import {
  educationNoteHasMore,
  getEducationExcerpt,
} from "@/lib/education/content";
import { getActiveEducationNotes } from "@/lib/education/queries";
import { EducationNoteTitleWithImage } from "@/components/site/education-note-media";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

export const dynamic = "force-dynamic";

export default async function EducacionPage() {
  if (!EDUCATION_PUBLIC_ENABLED) notFound();

  const notes = await getActiveEducationNotes();

  return (
    <main className="mx-auto w-full max-w-[58rem] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Educación
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Recursos para profundizar en el mundo del café de especialidad.
        </p>
      </section>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
          Pronto vas a encontrar notas y recursos educativos acá.
        </div>
      ) : (
        <div className="space-y-6">
          {notes.map((note) => {
            const excerpt = getEducationExcerpt(note.content);
            const hasMore = educationNoteHasMore(note.content);

            return (
              <article
                key={note.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <EducationNoteTitleWithImage note={note} title={note.title} />

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {excerpt}
                </p>

                {hasMore && (
                  <Link
                    href={`/educacion/${note.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-900 underline underline-offset-4 transition-colors hover:text-gray-600"
                  >
                    Leer nota completa
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-gray-500">
        ¿Querés probar nuestros cafés?{" "}
        <Link href="/cafe" className="font-medium text-gray-900 underline">
          Ver catálogo
        </Link>
      </p>
    </main>
  );
}
