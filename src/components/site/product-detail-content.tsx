import { Fragment } from "react";
import type { Coffee } from "@/lib/coffees/types";
import type { DescriptionBlock } from "@/lib/coffees/product-content";
import {
  buildProductStoryPreview,
  getExtendedContentUrl,
  hasExtendedContentUrl,
  hasProductStoryPreview,
  hasTechSheet,
  parseTastingNotes,
} from "@/lib/coffees/product-content";
import { ExtendedContentCatch } from "@/components/site/extended-content-catch";
import { OriBrandBand } from "@/components/site/ori-brand-band";

export function ProductDetailContent({ coffee }: { coffee: Coffee }) {
  const storyBlocks = buildProductStoryPreview(coffee);
  const extendedUrl = getExtendedContentUrl(coffee);
  const showExtendedCatch = hasExtendedContentUrl(coffee);
  const tastingNotes = parseTastingNotes(coffee.tasting_notes);
  const showTech = hasTechSheet(coffee);
  const showStory = hasProductStoryPreview(coffee);

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {(showStory || showExtendedCatch) && (
            <div className="mb-12">
              {showStory && storyBlocks.map(renderBlock)}
              {showExtendedCatch && extendedUrl && (
                <ExtendedContentCatch url={extendedUrl} productName={coffee.name} />
              )}
            </div>
          )}

          {(showTech || tastingNotes.length > 0) && (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {showTech && (
                <div className="space-y-4">
                  <h3 className="mb-2 border-b border-gray-200 pb-2 font-mono text-xs uppercase tracking-widest text-gray-600">
                    Ficha tecnica
                  </h3>
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
                    {coffee.altitude && <>Altitud: {coffee.altitude}</>}
                  </p>
                </div>
              )}

              {tastingNotes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="mb-2 border-b border-gray-200 pb-2 font-mono text-xs uppercase tracking-widest text-gray-600">
                    Notas de Cata
                  </h3>
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
          )}
        </div>
      </section>

      <OriBrandBand />
    </>
  );
}

function renderParts(parts: string[]) {
  return parts.map((part, index) => (
    <Fragment key={`${part.slice(0, 24)}-${index}`}>
      {index > 0 && (
        <>
          <br />
          <br />
        </>
      )}
      {part}
    </Fragment>
  ));
}

function renderBlock(block: DescriptionBlock, index: number) {
  if (block.type === "bold-lead") {
    return (
      <p key={index} className="mb-8 font-light leading-relaxed text-gray-700">
        <strong>{block.lead}</strong>
        {block.parts.length > 0 && (
          <>
            <br />
            <br />
            {renderParts(block.parts)}
          </>
        )}
      </p>
    );
  }

  return (
    <p key={index} className="mb-8 font-light leading-relaxed text-gray-700">
      {renderParts(block.parts)}
    </p>
  );
}
