import Link from "next/link";
import { isInternalExtendedContentHref } from "@/lib/coffees/extended-content";

type Props = {
  url: string;
  productName: string;
};

export function ExtendedContentCatch({ url, productName }: Props) {
  const ctaClassName =
    "mt-6 inline-flex h-11 items-center gap-2 bg-gray-900 px-8 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-black hover:shadow-lg";

  return (
    <aside className="group mt-10 border border-gray-200 bg-gray-50 p-8 transition-colors duration-300 hover:border-gray-300 hover:bg-stone-50 md:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
        Seguí leyendo
      </p>
      <h3 className="mt-3 text-xl font-medium tracking-tight text-gray-900 md:text-2xl">
        Conocé más sobre {productName}
      </h3>
      <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-gray-600">
        Este es solo un adelanto. La historia completa, el origen y todos los
        detalles están en nuestra nota de Educación.
      </p>
      {isInternalExtendedContentHref(url) ? (
        <Link href={url} className={ctaClassName}>
          Leer nota de educación
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClassName}
        >
          Leer nota de educación
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      )}
    </aside>
  );
}
