import { EducationNoteContent } from "@/components/site/education-note-content";
import { EducationNoteInlineImage } from "@/components/site/education-note-media";
import {
  getEducationContentAfter,
  getEducationContentBefore,
} from "@/lib/education/content";
import { getInlineEducationImages } from "@/lib/education/helpers";
import type { EducationNote } from "@/lib/education/types";

export function EducationNoteBody({ note }: { note: EducationNote }) {
  const inlineImages = getInlineEducationImages(note);
  const before = getEducationContentBefore(note);
  const after = getEducationContentAfter(note);

  if (inlineImages.length === 0) {
    return (
      <EducationNoteContent
        content={[before, after].filter(Boolean).join("\n\n")}
        noteTitle={note.title}
        className="mt-6"
      />
    );
  }

  return (
    <>
      {before.trim() && (
        <EducationNoteContent
          content={before}
          noteTitle={note.title}
          className="mt-6"
        />
      )}
      {inlineImages.map((image) => (
        <EducationNoteInlineImage key={image.id ?? image.url} url={image.url} />
      ))}
      {after.trim() && <EducationNoteContent content={after} noteTitle={note.title} />}
    </>
  );
}
