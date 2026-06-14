import { notFound } from "next/navigation";
import { EducationNoteForm } from "@/components/admin/education-note-form";
import { EducationNoteQr } from "@/components/admin/education-note-qr";
import { getEducationNoteByIdAdmin } from "@/lib/education/admin";
import { toEducationNoteFormData } from "@/lib/education/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function EditEducationNotePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const note = await getEducationNoteByIdAdmin(id);

  if (!note) {
    notFound();
  }

  const justCreated = created === "1";

  return (
    <div className="mx-auto max-w-[calc(42rem+4cm)] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {justCreated ? "Nota creada" : "Editar nota"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{note.title}</p>
      </div>
      <EducationNoteQr
        slug={note.slug}
        title={note.title}
        highlight={justCreated}
      />
      <EducationNoteForm
        mode="edit"
        noteId={note.id}
        initialData={toEducationNoteFormData(note)}
      />
    </div>
  );
}
