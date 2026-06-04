import type { Metadata } from "next";
import { AboutHeroImage } from "@/components/site/about-hero-image";

export const metadata: Metadata = {
  title: "Nosotros | Orí Cafe",
  description:
    "Conocé la historia de Orí, microtostadora de café de especialidad en Córdoba.",
};

const storyParagraphs = [
  "Orí nace como un puente entre el origen y la vida urbana. Somos una microtostadora de café de especialidad que cree en el café como ritual cotidiano: un momento para bajar un cambio, conectar y romantizar lo simple.",
  "Trabajamos con cafés trazables, de origen cuidado, seleccionados por su identidad y tostados para respetar y potenciar sus sabores únicos. Cada café que llega a tus manos tiene una historia clara: desde la finca hasta la taza.",
  "Nuestra mirada une el mundo del agro con una sensibilidad contemporánea y urbana. Creemos en procesos conscientes, en relaciones transparentes y en una estética que acompaña la experiencia sin quitarle protagonismo al café.",
  "Orí es exploración, curiosidad y afinidad. Un espacio para descubrir qué hay detrás de un buen café y para disfrutarlo con intención, todos los días.",
];

const values = [
  {
    title: "Calidad",
    description:
      "Ser microtostadores de café de especialidad nos permite acompañar cada proceso de cerca, cuidar cada perfil de sabor y asegurarte café fresco, tal como fue pensado desde origen.",
  },
  {
    title: "Consumo consciente",
    description:
      "Orí es un espacio para descubrir el verdadero café de especialidad, un recorrido que empieza en la finca y llega a tu casa.",
  },
  {
    title: "Sostenibilidad",
    description:
      "Respetamos la tierra que nos da el café. Apoyamos el comercio justo y trabajamos para reducir nuestra huella.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="bg-gray-100 px-6 pb-24 pt-12 md:pb-32 md:pt-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 md:grid-cols-12 md:gap-20">
          <div className="md:col-span-4">
            <h1 className="mb-2 text-3xl font-medium text-gray-900 md:text-4xl">
              Nuestra Historia
            </h1>
            <span className="mt-6 block h-px w-12 bg-white" aria-hidden />
          </div>

          <div className="md:col-span-5 md:col-start-6">
            <div className="font-light leading-8 text-gray-500">
              {storyParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={index < storyParagraphs.length - 1 ? "mb-8" : undefined}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-[1440px]">
          <AboutHeroImage />
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-900/30 px-6 py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <h2 className="text-3xl font-medium uppercase tracking-tight text-gray-900">
              Lo que nos define
            </h2>
            <p className="max-w-md text-sm text-gray-500 md:text-right">
              Nuestros valores son la brújula que guía cada decisión.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px border border-gray-200 bg-gray-800 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="group flex h-full flex-col bg-white p-10 transition-colors duration-300 hover:bg-gray-900 md:p-14"
              >
                <h3 className="mb-4 text-lg font-medium uppercase tracking-wide text-gray-900 transition-colors duration-300 group-hover:text-white">
                  {value.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-300">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
