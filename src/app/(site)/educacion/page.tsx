import Link from "next/link";
import { notFound } from "next/navigation";
import { EDUCATION_SECTION_META } from "@/lib/education/sections";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

export const dynamic = "force-dynamic";

const hubSections = [
  EDUCATION_SECTION_META.blog,
  EDUCATION_SECTION_META.prepara_en_casa,
] as const;

export default function EducacionHubPage() {
  if (!EDUCATION_PUBLIC_ENABLED) notFound();

  return (
    <main className="mx-auto w-full max-w-[58rem] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-14 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Educación
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Elegí cómo querés seguir: notas del blog o recetas para prepararte el café
          en casa.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {hubSections.map((section) => (
          <Link
            key={section.path}
            href={section.path}
            className="group relative overflow-hidden border border-gray-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/40 px-7 py-10 transition duration-300 hover:border-gray-400"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">
              Educación
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {section.description}
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-900 underline underline-offset-4 transition-colors group-hover:text-gray-600">
              {section.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
