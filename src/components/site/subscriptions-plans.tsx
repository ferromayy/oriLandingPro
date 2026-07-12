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
  const [selectedId, setSelectedId] = useState(plans[0]?.id ?? "");
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];

  const whatsappHref = selected
    ? buildWhatsAppCheckoutUrl(buildSubscriptionMessage(selected.name))
    : `https://wa.me/${WHATSAPP_ORDER_NUMBER}`;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const active = plan.id === selected?.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedId(plan.id)}
              className={`relative flex h-full flex-col overflow-hidden border bg-white p-6 pt-7 text-left transition ${
                active
                  ? "border-gray-900 ring-1 ring-gray-900"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: plan.accent }}
                aria-hidden
              />
              <span
                className="pointer-events-none absolute right-4 top-8 h-9 w-9 rounded-full"
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
                className="mt-4 block h-0.5 w-10"
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
                className={`mt-6 text-xs font-medium uppercase tracking-widest ${
                  active
                    ? "text-gray-900 underline underline-offset-4"
                    : "text-gray-500"
                }`}
              >
                {active ? "Seleccionado" : "Elegir"}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden border border-gray-200 bg-gray-50 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <span
            className="absolute inset-y-0 left-0 w-1"
            style={{ backgroundColor: selected.accent }}
            aria-hidden
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Tu plan
            </p>
            <p className="mt-2 text-lg font-medium text-gray-900">{selected.name}</p>
            <p className="mt-1 max-w-xl text-sm text-gray-600">{selected.tagline}</p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center bg-gray-900 px-8 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black"
          >
            Iniciar suscripción
          </a>
        </div>
      )}
    </div>
  );
}
