import { getActiveCoffees } from "@/lib/coffees/queries";
import { ProductCard } from "@/components/site/product-card";

export default async function HomePage() {
  const coffees = await getActiveCoffees();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-10">
      <section className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Encontrá el café que mejor va con vos
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Café de especialidad tostado en Córdoba, con trazabilidad y cuidado en
          cada proceso.
        </p>
      </section>

      {coffees.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
          <p className="font-medium">No hay cafés publicados todavía.</p>
          <p className="mt-2">
            Ejecuta la migración SQL en Supabase (
            <code className="rounded bg-white/60 px-1">supabase/migrations/001_coffees.sql</code>
            ) o cargá productos desde el{" "}
            <a href="/admin/coffees" className="underline">
              panel admin
            </a>
            .
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {coffees.map((coffee) => (
            <ProductCard key={coffee.id} coffee={coffee} />
          ))}
        </section>
      )}
    </main>
  );
}
