"use client";

import { useState } from "react";

const DEFAULT_IMAGE = "/images/about/nosotros.jpg";
const HOVER_IMAGE = "/images/about/nosotros2.png";

export function AboutHeroImage() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative aspect-[21/9] w-full overflow-hidden bg-gray-800"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{ backgroundImage: `url("${DEFAULT_IMAGE}")` }}
        role="img"
        aria-label="Nosotros"
      />
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url("${HOVER_IMAGE}")` }}
        aria-hidden={!hovered}
      />
    </div>
  );
}
