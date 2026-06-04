import type { Metadata } from "next";
import { WholesaleContactForm } from "@/components/site/wholesale-contact-form";

export const metadata: Metadata = {
  title: "Mayoristas y asesoramiento | Orí Cafe",
  description:
    "Beneficios exclusivos y asesoramiento para cafeterías, oficinas y restaurantes que quieran trabajar con Orí.",
};

export default function MayoristasPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="w-full bg-white px-4 py-16 sm:px-10 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-gray-600">
              Sección Mayoristas
            </span>
          </div>

          <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-24">
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-medium tracking-tight text-gray-900">
                Beneficios Exclusivos
              </h1>
              <div className="space-y-4 text-base leading-relaxed text-gray-700">
                <p>
                  Si estás pensando en ofrecer café de especialidad en tu espacio
                  ya sea una cafetería, oficina, o restaurante— nos encantaría
                  acompañarte en ese proceso.
                </p>
                <p>
                  Completá este formulario y juntos vamos a construir una
                  propuesta personalizada, pensada para adaptarse a tu negocio y a
                  la experiencia que querés ofrecer.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-medium tracking-tight text-gray-900">
                Asesoramiento
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-gray-700">
                <p>
                  Acompañamos a cafeterías que buscan trabajar con Orí y elevar
                  su propuesta de café. Desde la selección del grano hasta la
                  forma de prepararlo, ofrecemos un asesoramiento pensado para
                  cada espacio.
                </p>
                <p>Completá el formulario y contanos sobre tu proyecto.</p>
              </div>
            </div>
          </div>

          <WholesaleContactForm />
        </div>
      </section>
    </main>
  );
}
