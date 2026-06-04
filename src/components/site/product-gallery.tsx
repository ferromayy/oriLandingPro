"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { Coffee } from "@/lib/coffees/types";
import { getGalleryImages } from "@/lib/coffees/helpers";

export function ProductGallery({ coffee }: { coffee: Coffee }) {
  const images = getGalleryImages(coffee);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const selectImage = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setIsTransitioning(true);
      window.setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 150);
    },
    [activeIndex],
  );

  if (images.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-gray-100 text-gray-400 lg:h-[60vh]">
        Sin imágenes
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];
  const thumbnails = images;

  return (
    <div className="lg:sticky lg:top-20">
      <div className="relative mb-4 h-[50vh] overflow-hidden lg:h-[60vh]">
        <Image
          key={active.url}
          src={active.url}
          alt={coffee.name}
          fill
          priority
          className={`cursor-pointer object-cover transition-all duration-700 ease-out hover:scale-105 ${
            isTransitioning ? "scale-[1.02] opacity-90" : "scale-100 opacity-100"
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {thumbnails.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {thumbnails.map((img, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={img.id ?? `${img.url}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={isActive}
                className={`group relative h-32 overflow-hidden lg:h-40 ${
                  isActive ? "ring-2 ring-gray-900 ring-offset-2" : ""
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div
                  className={`absolute inset-0 transition-colors duration-300 ${
                    isActive
                      ? "bg-black/10"
                      : "bg-black/0 group-hover:bg-black/10"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
