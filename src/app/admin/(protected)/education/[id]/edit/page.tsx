import { notFound } from "next/navigation";
import { EducationNoteForm } from "@/components/admin/education-note-form";
import { getEducationNoteByIdAdmin } from "@/lib/education/admin";
import { toEducationNoteFormData } from "@/lib/education/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEducationNotePage({ params }: Props) {
  const { id } = await params;
  const note = await getEducationNoteByIdAdmin(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Editar nota</h1>
        <p className="mt-1 text-sm text-zinc-600">{note.title}</p>
      </div>
      <EducationNoteForm
        mode="edit"
        noteId={note.id}
        initialData={toEducationNoteFormData(note)}
      />
    </div>
  );
}
