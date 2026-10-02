import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademiaEventCard } from "@/components/site/academia-event-card";
import { getActiveAcademiaEvents } from "@/lib/academia/queries";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

export const dynamic = "force-dynamic";

export default async function EducacionAcademiaPage() {
  if (!EDUCATION_PUBLIC_ENABLED) notFound();

  const events = await getActiveAcademiaEvents();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/educacion"
        className="mb-6 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Educación
      </Link>

      <section className="mb-8 max-w-3xl sm:mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">
          Educación
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          Academia
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-[1.05rem]">
          Creemos que entender más sobre café también es una forma de disfrutarlo
          más. Por eso buscamos que la educación sea cada vez más accesible,
          cercana y rigurosa: para quienes preparan café en casa, para quienes
          trabajan detrás de una barra y para quienes simplemente quieren saber un
          poco más sobre lo que tienen en la taza. De ahí nace esta alianza.
        </p>
      </section>

      {events.length === 0 ? (
        <div className="mx-auto max-w-[58rem] border border-gray-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/40 px-7 py-14 text-center">
          <p className="text-sm leading-relaxed text-gray-600">
            Pronto vas a encontrar acá los contenidos de la Academia Orí.
          </p>
          <Link
            href="/educacion"
            className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-900 underline underline-offset-4 transition-colors hover:text-gray-600"
          >
            Ver Blog y Prepará en casa
            <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <AcademiaEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
