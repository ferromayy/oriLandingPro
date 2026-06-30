import type { Coffee } from "@/lib/coffees/types";
import { hasTechSheet, parseTastingNotes } from "@/lib/coffees/product-content";

export function ProductTechAndTasting({ coffee }: { coffee: Coffee }) {
  const tastingNotes = parseTastingNotes(coffee.tasting_notes);
  const showTech = hasTechSheet(coffee);

  if (!showTech && tastingNotes.length === 0) return null;

  return (
    <div className="mb-10 grid grid-cols-1 gap-8 border-t border-gray-200 pt-8 sm:grid-cols-2">
      {showTech && (
        <div className="space-y-3">
          <h2 className="border-b border-gray-200 pb-2 font-mono text-xs uppercase tracking-widest text-gray-600">
            Ficha técnica
          </h2>
          <p className="text-sm font-light leading-relaxed text-gray-700">
            {coffee.origin && (
              <>
                Origen: {coffee.origin}
                <br />
              </>
            )}
            {coffee.varietal && (
              <>
                Varietal: {coffee.varietal}
                <br />
              </>
            )}
            {coffee.beneficio && (
              <>
                Beneficio: {coffee.beneficio}
                <br />
              </>
            )}
            {coffee.producer && (
              <>
                Productor: {coffee.producer}
                <br />
              </>
            )}
            {coffee.altitude && <>Altitud: {coffee.altitude}</>}
          </p>
        </div>
      )}

      {tastingNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="border-b border-gray-200 pb-2 font-mono text-xs uppercase tracking-widest text-gray-600">
            Notas de cata
          </h2>
          <ul className="space-y-2 text-sm font-light leading-relaxed text-gray-700">
            {tastingNotes.map((note) => (
              <li key={note} className="flex items-center">
                <span className="mr-3 h-2 w-2 shrink-0 rounded-full bg-gray-600" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
