import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEducationNoteById } from "@/lib/education/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EducacionNotePage({ params }: Props) {
  const { id } = await params;
  const note = await getEducationNoteById(id);

  if (!note) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-10">
      <Link
        href="/educacion"
        className="mb-8 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Volver a Educación
      </Link>

      <article className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {note.title}
        </h1>

        {note.education_note_images.length > 0 && (
          <div
            className={`mt-6 grid gap-3 ${
              note.education_note_images.length === 1
                ? "grid-cols-1"
                : note.education_note_images.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {note.education_note_images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 sm:text-base">
          {note.content}
        </div>
      </article>
    </main>
  );
}
