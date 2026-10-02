import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademiaEventForm } from "@/components/admin/academia-event-form";
import { getAcademiaEventByIdAdmin } from "@/lib/academia/admin";
import { toAcademiaEventFormData } from "@/lib/academia/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditAcademiaEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getAcademiaEventByIdAdmin(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/education"
          className="text-xs font-medium text-zinc-500 underline hover:text-zinc-800"
        >
          ← Volver a Educación
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Editar evento</h1>
        <p className="mt-1 text-sm text-zinc-600">{event.title}</p>
      </div>

      <AcademiaEventForm
        mode="edit"
        eventId={event.id}
        initialData={toAcademiaEventFormData(event)}
      />
    </div>
  );
}
