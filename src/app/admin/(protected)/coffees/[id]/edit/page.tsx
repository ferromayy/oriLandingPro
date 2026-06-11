import { notFound } from "next/navigation";
import { CoffeeForm } from "@/components/admin/coffee-form";
import { getCoffeeByIdAdmin } from "@/lib/coffees/admin";
import { coffeeToFormData } from "@/lib/coffees/types";
import { getAllEducationNotesAdmin } from "@/lib/education/admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditCoffeePage({ params }: Props) {
  const { id } = await params;

  let coffee;
  try {
    coffee = await getCoffeeByIdAdmin(id);
  } catch {
    notFound();
  }

  if (!coffee) notFound();

  let educationNotes: Awaited<ReturnType<typeof getAllEducationNotesAdmin>> = [];
  try {
    educationNotes = await getAllEducationNotesAdmin();
  } catch {
    educationNotes = [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Editar café</h1>
        <p className="mt-1 text-sm text-zinc-600">{coffee.name}</p>
      </div>
      <CoffeeForm
        mode="edit"
        coffeeId={coffee.id}
        initialData={coffeeToFormData(coffee)}
        educationNotes={educationNotes.map((note) => ({
          id: note.id,
          title: note.title,
          slug: note.slug,
        }))}
      />
    </div>
  );
}
