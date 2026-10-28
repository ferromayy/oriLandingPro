"use client";

import { useEffect, useState } from "react";
import { CoffeeCatalogFilter } from "@/components/site/coffee-catalog-filter";
import { ProductCard } from "@/components/site/product-card";
import type { Coffee } from "@/lib/coffees/types";
import {
  filterCoffeesByOrigin,
  listCatalogOrigins,
} from "@/lib/coffees/origin";
import {
  filterCoffeesByProcess,
  listCatalogProcesses,
  type CoffeeProcess,
} from "@/lib/coffees/process";

type Props = {
  coffees: Coffee[];
  id?: string;
};

export function CoffeeCatalogBrowser({ coffees, id }: Props) {
  const [process, setProcess] = useState<CoffeeProcess | "">("");
  const [origin, setOrigin] = useState("");
  const processes = listCatalogProcesses(coffees);
  const origins = listCatalogOrigins(coffees);
  const visible = filterCoffeesByOrigin(
    filterCoffeesByProcess(coffees, process),
    origin,
  );

  useEffect(() => {
    if (origin && !origins.includes(origin)) setOrigin("");
  }, [origin, origins]);

  useEffect(() => {
    if (process && !processes.includes(process)) setProcess("");
  }, [process, processes]);

  const hasFilters = origins.length > 0 || processes.length > 0;

  return (
    <>
      {hasFilters && (
        <div className="mb-10 flex flex-col gap-8 sm:flex-row sm:items-start">
          <CoffeeCatalogFilter
            label="Origen"
            value={origin}
            options={origins}
            onChange={setOrigin}
          />
          <CoffeeCatalogFilter
            label="Proceso"
            value={process}
            options={processes}
            onChange={(value) => setProcess(value as CoffeeProcess | "")}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-600">
          No hay cafés con esos filtros por ahora.
        </p>
      ) : (
        <section
          id={id}
          className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((coffee) => (
            <ProductCard key={coffee.id} coffee={coffee} />
          ))}
        </section>
      )}
    </>
  );
}
