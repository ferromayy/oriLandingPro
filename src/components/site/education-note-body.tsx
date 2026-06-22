import { EducationNoteContent } from "@/components/site/education-note-content";
import { EducationNoteInlineImage } from "@/components/site/education-note-media";
import { splitEducationContentAtMiddle } from "@/lib/education/content";
import { getInlineEducationImage } from "@/lib/education/helpers";
import { normalizeEducationMarkdown } from "@/lib/education/markdown";
import type { EducationNote } from "@/lib/education/types";

export function EducationNoteBody({ note }: { note: EducationNote }) {
  const inlineImage = getInlineEducationImage(note);
  const preparedContent = normalizeEducationMarkdown(note.content, note.title);

  if (!inlineImage) {
    return (
      <EducationNoteContent
        content={preparedContent}
        noteTitle={note.title}
        className="mt-6"
      />
    );
  }

  const [firstHalf, secondHalf] = splitEducationContentAtMiddle(preparedContent);

  return (
    <>
      <EducationNoteContent
        content={firstHalf}
        noteTitle={note.title}
        className="mt-6"
      />
      <EducationNoteInlineImage url={inlineImage.url} />
      {secondHalf.trim() && (
        <EducationNoteContent content={secondHalf} noteTitle={note.title} />
      )}
    </>
  );
}
