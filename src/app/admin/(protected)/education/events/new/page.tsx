import Link from "next/link";
import { AcademiaEventForm } from "@/components/admin/academia-event-form";

export default function AdminNewAcademiaEventPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/education"
          className="text-xs font-medium text-zinc-500 underline hover:text-zinc-800"
        >
          ← Volver a Educación
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Nuevo evento</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Se publica en la sección Academia del sitio.
        </p>
      </div>

      <AcademiaEventForm mode="create" />
    </div>
  );
}
