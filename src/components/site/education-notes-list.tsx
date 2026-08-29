import Link from "next/link";
import {
  educationNoteHasMore,
  getEducationExcerpt,
} from "@/lib/education/content";
import type { EducationNote } from "@/lib/education/types";
import { EducationNoteTitleWithImage } from "@/components/site/education-note-media";

type Props = {
  notes: EducationNote[];
  emptyMessage: string;
  readLabel?: string;
};

export function EducationNotesList({
  notes,
  emptyMessage,
  readLabel = "Leer nota completa",
}: Props) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notes.map((note) => {
        const excerpt = getEducationExcerpt(note);
        const hasMore = educationNoteHasMore(note);

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
                {readLabel}
                <span aria-hidden>→</span>
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
