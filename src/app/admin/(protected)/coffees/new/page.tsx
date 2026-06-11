import { CoffeeForm } from "@/components/admin/coffee-form";
import { getAllEducationNotesAdmin } from "@/lib/education/admin";

export default async function NewCoffeePage() {
  let educationNotes: Awaited<ReturnType<typeof getAllEducationNotesAdmin>> = [];
  try {
    educationNotes = await getAllEducationNotesAdmin();
  } catch {
    educationNotes = [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Nuevo café</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Completá los datos que se muestran en la landing.
        </p>
      </div>
      <CoffeeForm
        mode="create"
        educationNotes={educationNotes.map((note) => ({
          id: note.id,
          title: note.title,
          slug: note.slug,
        }))}
      />
    </div>
  );
}
