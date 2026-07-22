"use client";

import { useState } from "react";
import {
  WHATSAPP_ORDER_NUMBER,
  buildWhatsAppCheckoutUrl,
} from "@/lib/site/whatsapp-order";

export type SubscriptionPlan = {
  id: string;
  name: string;
  audience: string;
  tagline: string;
  description: string;
  /** Acento de paleta Orí (solo detalle visual). */
  accent: string;
  details: {
    about: string;
    includes: string[];
    bestFor: string;
  };
};

type Props = {
  plans: SubscriptionPlan[];
};

function buildSubscriptionMessage(planName: string): string {
  return [
    "Hola Orí!",
    "",
    `Quiero empezar una suscripción: ${planName}.`,
    "¿Me cuentan cómo sigue el proceso?",
  ].join("\n");
}

export function SubscriptionsPlans({ plans }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = plans.find((plan) => plan.id === selectedId) ?? null;

  const whatsappHref = selected
    ? buildWhatsAppCheckoutUrl(buildSubscriptionMessage(selected.name))
    : `https://wa.me/${WHATSAPP_ORDER_NUMBER}`;

  function handleSelect(planId: string) {
    setSelectedId((current) => (current === planId ? null : planId));
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, index) => {
          const active = plan.id === selected?.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelect(plan.id)}
              aria-expanded={active}
              aria-controls="plan-detail"
              style={{
                animationDelay: `${index * 80}ms`,
                borderColor: active ? plan.accent : undefined,
              }}
              className={`ori-plan-enter group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] rounded-tr-[3.5rem] border bg-white p-7 pt-8 text-left shadow-[0_1px_3px_rgba(17,24,39,0.05)] transition duration-300 ease-out ${
                active
                  ? "shadow-[0_14px_34px_-18px_rgba(17,24,39,0.28)]"
                  : "border-gray-200/80 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_14px_34px_-20px_rgba(17,24,39,0.25)]"
              }`}
            >
              <span
                className={`pointer-events-none absolute right-5 top-5 h-9 w-9 rounded-full transition duration-300 ease-out ${
                  active
                    ? "scale-125"
                    : "scale-100 group-hover:scale-[1.35]"
                }`}
                style={{ backgroundColor: plan.accent }}
                aria-hidden
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                {plan.audience}
              </p>
              <h3 className="mt-3 pr-12 text-lg font-medium uppercase tracking-widest text-gray-900">
                {plan.name}
              </h3>
              <span
                className={`mt-4 block h-0.5 w-10 rounded-full transition-colors duration-300 ${
                  active ? "ori-plan-rule-active" : ""
                }`}
                style={{
                  backgroundColor: active ? plan.accent : "#d1d5db",
                }}
                aria-hidden
              />
              <p className="mt-5 text-sm font-medium leading-relaxed text-gray-800">
                {plan.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                {plan.description}
              </p>
              <span
                className={`mt-6 text-xs font-medium uppercase tracking-widest transition-colors duration-300 ${
                  active
                    ? "text-gray-900 underline underline-offset-4"
                    : "text-gray-500 group-hover:text-gray-800"
                }`}
              >
                {active ? "Ver menos" : "Saber más"}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          id="plan-detail"
          key={selected.id}
          className="ori-plan-panel-enter relative overflow-hidden rounded-[1.75rem] rounded-bl-[3.5rem] border border-gray-200/80 bg-gray-50"
        >
          <span
            className="absolute inset-y-6 left-0 w-1 rounded-full"
            style={{ backgroundColor: selected.accent }}
            aria-hidden
          />

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Sobre este plan
                </p>
                <h3 className="mt-3 text-2xl font-medium tracking-tight text-gray-900">
                  {selected.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {selected.tagline}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-gray-600 md:text-base">
                  {selected.details.about}
                </p>
                <p className="mt-6 text-sm leading-relaxed text-gray-600">
                  <span className="font-medium text-gray-900">Ideal para: </span>
                  {selected.details.bestFor}
                </p>
              </div>

              <div className="w-full shrink-0 lg:max-w-xs">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Qué incluye
                </p>
                <ul className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  {selected.details.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-gray-700"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: selected.accent }}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-600">
                Te acompañamos por WhatsApp con cantidad, molienda y frecuencia.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-gray-900 px-9 text-xs font-medium uppercase tracking-widest text-white transition duration-300 hover:bg-black"
              >
                Iniciar suscripción
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
