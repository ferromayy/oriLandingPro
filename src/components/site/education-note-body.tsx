import { EducationNoteContent } from "@/components/site/education-note-content";
import { EducationNoteInlineImage } from "@/components/site/education-note-media";
import {
  getEducationContentAfter,
  getEducationContentBefore,
} from "@/lib/education/content";
import { getInlineEducationImage } from "@/lib/education/helpers";
import type { EducationNote } from "@/lib/education/types";

export function EducationNoteBody({ note }: { note: EducationNote }) {
  const inlineImage = getInlineEducationImage(note);
  const before = getEducationContentBefore(note);
  const after = getEducationContentAfter(note);

  if (!inlineImage) {
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
      <EducationNoteInlineImage url={inlineImage.url} />
      {after.trim() && <EducationNoteContent content={after} noteTitle={note.title} />}
    </>
  );
}
