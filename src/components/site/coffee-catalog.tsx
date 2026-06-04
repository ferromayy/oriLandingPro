import { getActiveCoffees } from "@/lib/coffees/queries";
import { ProductCard } from "@/components/site/product-card";

type CoffeeCatalogProps = {
  id?: string;
  title?: string;
  description?: string;
};

export async function CoffeeCatalog({
  id,
  title = "Encontrá el café que mejor va con vos",
  description = "Café de especialidad tostado en Córdoba, con trazabilidad y cuidado en cada proceso.",
}: CoffeeCatalogProps) {
  const coffees = await getActiveCoffees();

  return (
    <>
      <section className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">{description}</p>
      </section>

      {coffees.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
          <p className="font-medium">No hay cafés publicados todavía.</p>
          <p className="mt-2">
            Ejecutá la migración SQL en Supabase (
            <code className="rounded bg-white/60 px-1">
              supabase/migrations/001_coffees.sql
            </code>
            ) o cargá productos desde el{" "}
            <a href="/admin/coffees" className="underline">
              panel admin
            </a>
            .
          </p>
        </div>
      ) : (
        <section
          id={id}
          className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {coffees.map((coffee) => (
            <ProductCard key={coffee.id} coffee={coffee} />
          ))}
        </section>
      )}
    </>
  );
}
