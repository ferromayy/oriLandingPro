import type { Metadata } from "next";
import {
  SubscriptionsPlans,
  type SubscriptionPlan,
} from "@/components/site/subscriptions-plans";
import { buildWhatsAppCheckoutUrl } from "@/lib/site/whatsapp-order";

export const metadata: Metadata = {
  title: "Suscripciones | Orí Cafe",
  description:
    "Nunca te quedes sin café fresco. Suscripciones Orí de café de especialidad todos los meses, con beneficios exclusivos.",
};

const plans: SubscriptionPlan[] = [
  {
    id: "casa",
    name: "Plan Casa",
    audience: "Para el día a día",
    tagline: "El café de especialidad para todos los días.",
    description:
      "Pensado para quienes quieren tener siempre café fresco en casa y olvidarse de volver a comprar cada mes.",
    accent: "rgba(232, 119, 34, 0.92)",
    details: {
      about:
        "Recibís cafés de nuestra línea estable: perfiles equilibrados, fáciles de preparar y pensados para acompañar tu ritual diario sin complicaciones. Cada mes llega café fresco tostado en Córdoba, listo para moler o ya molido según tu preferencia.",
      includes: [
        "Café de especialidad de la línea Casa",
        "Envío mensual con café recién tostado",
        "Elección de grano o molienda",
        "Precio preferencial de suscriptor",
      ],
      bestFor:
        "casas y personas que toman café todos los días y quieren calidad constante sin tener que acordarse de pedir.",
    },
  },
  {
    id: "reserva",
    name: "Plan Reserva",
    audience: "Para descubrir",
    tagline: "Ediciones limitadas, microlotes y cafés más exclusivos.",
    description: "Una experiencia diferente en cada envío.",
    accent: "rgba(227, 6, 19, 0.92)",
    details: {
      about:
        "Cada mes te llega un café distinto: microlotes, orígenes rotativos y ediciones limitadas seleccionadas por el equipo de Orí. Es la forma de explorar perfiles más expresivos y conocer lo que no siempre está en el catálogo.",
      includes: [
        "Café de edición limitada o microlote",
        "Rotación de orígenes y procesos",
        "Ficha sensorial del café del mes",
        "Prioridad de stock en lotes exclusivos",
      ],
      bestFor:
        "quienes disfrutan descubrir notas nuevas, comparar orígenes y vivir el café como una experiencia, no solo como una rutina.",
    },
  },
  {
    id: "mix",
    name: "Plan Mix",
    audience: "Lo mejor de ambos",
    tagline: "Lo mejor de los dos mundos.",
    description:
      "Un café de nuestra línea estable y otro de edición limitada en cada envío.",
    accent: "rgba(196, 176, 140, 0.92)",
    details: {
      about:
        "Combinás la seguridad de un café cotidiano con la sorpresa de una edición limitada. En cada envío recibís un café de la línea estable para el día a día y otro más exclusivo para explorar cuando quieras algo distinto.",
      includes: [
        "Un café de la línea Casa",
        "Un café Reserva / edición limitada",
        "Variedad sin perder la rutina",
        "Flexibilidad de molienda en ambos",
      ],
      bestFor:
        "parejas, hogares compartidos o cualquiera que quiera un café confiable y, a la vez, algo especial para probar.",
    },
  },
  {
    id: "oficina",
    name: "Plan Oficina",
    audience: "Para equipos",
    tagline: "Café de especialidad para tu equipo.",
    description:
      "Entregas programadas y beneficios exclusivos para empresas.",
    accent: "rgba(0, 87, 184, 0.92)",
    details: {
      about:
        "Armamos una entrega pensada para el consumo de tu equipo: cantidad, frecuencia y perfil de café según cuántas personas sean y cómo preparan. Menos logística para vos, mejor café en la oficina todos los días.",
      includes: [
        "Volúmenes adaptados al tamaño del equipo",
        "Entregas programadas a la oficina",
        "Asesoramiento de perfil y método",
        "Condiciones especiales para empresas",
      ],
      bestFor:
        "estudios, oficinas y equipos que quieren elevar el café del día a día sin gestionar compras sueltas cada semana.",
    },
  },
];

const benefits = [
  {
    title: "Precio preferencial",
    description: "Condiciones especiales para quienes se suscriben a Orí.",
  },
  {
    title: "Descuentos extra",
    description: "Beneficios en compras adicionales fuera de tu envío mensual.",
  },
  {
    title: "Prioridad de stock",
    description: "Acceso preferente a cafés y lotes con stock limitado.",
  },
  {
    title: "Según duración",
    description:
      "Beneficios adicionales que crecen con el tiempo de tu suscripción.",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Elegí tu plan",
    description:
      "Casa, Reserva, Mix u Oficina: la experiencia que mejor se adapta a vos o a tu equipo.",
  },
  {
    number: "02",
    title: "Escribinos",
    description:
      "Iniciá la suscripción por WhatsApp y te acompañamos con cantidades, molienda y frecuencia.",
  },
  {
    number: "03",
    title: "Recibí tu café",
    description:
      "Café fresco todos los meses, con los beneficios exclusivos de suscriptor.",
  },
] as const;

const generalWhatsAppHref = buildWhatsAppCheckoutUrl(
  [
    "Hola Orí!",
    "",
    "Quiero conocer más sobre las suscripciones de café.",
  ].join("\n"),
);

export default function SuscripcionesPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="relative overflow-hidden bg-white px-4 pb-16 pt-12 sm:px-10 md:pb-24 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 8% 0%, rgba(243,244,246,0.9), transparent 42%), linear-gradient(180deg, #f3f4f6 0%, #ffffff 38%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1100px]">
          <div className="mb-10 max-w-2xl md:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gray-500">
              Orí · Elegí tu experiencia
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight text-gray-900 md:text-4xl">
              Suscripciones
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Nunca te quedes sin café fresco. Primero te posicionás en el plan
              que más te representa; después arrancamos juntos la experiencia.
            </p>
          </div>

          <SubscriptionsPlans plans={plans} />
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 sm:px-10 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 md:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
              Incluye
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-gray-900 md:text-3xl">
              Beneficios
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-gray-200 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title}>
                <h3 className="text-sm font-medium uppercase tracking-widest text-gray-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-10 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 md:mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
              Cómo funciona
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-gray-900 md:text-3xl">
              Tres pasos
            </h2>
          </div>

          <ol className="grid grid-cols-1 gap-10 border-t border-gray-200 pt-10 md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <li key={step.number}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
                  {step.number}
                </p>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-900 px-4 py-16 sm:px-10 md:py-20">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gray-400">
            Orí
          </p>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white md:text-3xl">
            Empezá tu suscripción hoy
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
            Elegí tu plan arriba o escribinos y te ayudamos a armar la
            experiencia ideal para tu casa, tu ritual o tu oficina.
          </p>
          <a
            href={generalWhatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center bg-white px-8 text-xs font-medium uppercase tracking-widest text-gray-900 transition hover:bg-gray-100"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
