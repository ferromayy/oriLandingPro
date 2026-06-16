import { Fragment } from "react";
import type { Coffee } from "@/lib/coffees/types";
import type { DescriptionBlock } from "@/lib/coffees/product-content";
import {
  buildProductStoryPreview,
  getExtendedContentUrl,
  hasExtendedContentUrl,
  hasProductStoryPreview,
} from "@/lib/coffees/product-content";
import { ExtendedContentCatch } from "@/components/site/extended-content-catch";
import { OriBrandBand } from "@/components/site/ori-brand-band";

export function ProductDetailContent({ coffee }: { coffee: Coffee }) {
  const storyBlocks = buildProductStoryPreview(coffee);
  const extendedUrl = getExtendedContentUrl(coffee);
  const showExtendedCatch = hasExtendedContentUrl(coffee);
  const showStory = hasProductStoryPreview(coffee);

  if (!showStory && !showExtendedCatch) {
    return <OriBrandBand />;
  }

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div>
            {showStory && storyBlocks.map(renderBlock)}
            {showExtendedCatch && extendedUrl && (
              <ExtendedContentCatch
                url={extendedUrl}
                productName={coffee.name}
                customCatchText={coffee.extended_content_catch_text}
              />
            )}
          </div>
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
