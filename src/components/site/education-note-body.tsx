import { EducationNoteContent } from "@/components/site/education-note-content";
import { EducationNoteInlineImage } from "@/components/site/education-note-media";
import { getEducationContentBlocks } from "@/lib/education/blocks";
import type { EducationNote } from "@/lib/education/types";

export function EducationNoteBody({ note }: { note: EducationNote }) {
  const blocks = getEducationContentBlocks(note).filter(
    (block) => block.text.trim() || block.images.length > 0,
  );

  if (blocks.length === 0) return null;

  return (
    <div className="mt-6 space-y-10">
      {blocks.map((block, index) => (
        <section key={`block-${index}`} className="space-y-6">
          {block.text.trim() && (
            <EducationNoteContent
              content={block.text}
              noteTitle={note.title}
            />
          )}
          {block.images.length > 0 && (
            <div
              className={
                block.images.length === 1
                  ? "space-y-0"
                  : block.images.length === 2
                    ? "grid gap-4 sm:grid-cols-2"
                    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {block.images.map((url, imageIndex) => (
                <EducationNoteInlineImage
                  key={`${url}-${imageIndex}`}
                  url={url}
                  compact={block.images.length > 1}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
