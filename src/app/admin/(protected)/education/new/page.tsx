import { EducationNoteForm } from "@/components/admin/education-note-form";

export default function NewEducationNotePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Nueva nota</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Se publicará en la sección Educación del sitio.
        </p>
      </div>
      <EducationNoteForm mode="create" />
    </div>
  );
}
