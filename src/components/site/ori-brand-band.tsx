import Image from "next/image";

const BRAND_BAND_IMAGE = "/images/about/nosotros2.png";

export function OriBrandBand() {
  return (
    <section className="w-full bg-black">
      <div className="relative mx-auto aspect-[21/9] w-full max-w-[1920px]">
        <Image
          src={BRAND_BAND_IMAGE}
          alt="Orí Tostadores de café"
          fill
          className="object-contain object-center"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
