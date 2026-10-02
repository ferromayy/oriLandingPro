import Image from "next/image";
import type { AcademiaEvent } from "@/lib/academia/types";
import { buildAcademiaInfoWhatsAppUrl } from "@/lib/site/whatsapp-order";

type Props = {
  event: AcademiaEvent;
};

export function AcademiaEventCard({ event }: Props) {
  const whatsappHref = buildAcademiaInfoWhatsAppUrl();

  return (
    <article className="flex h-full flex-col border border-gray-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/40">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-1 flex-col outline-none transition hover:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
        aria-label={`Consultar por WhatsApp: ${event.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          />
        </div>
        <div className="flex flex-1 flex-col px-5 pb-2 pt-5">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            {event.title}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{event.subtitle}</p>
        </div>
      </a>

      <div className="px-5 pb-5 pt-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-800"
        >
          Más info
          <span aria-hidden className="no-underline">
            →
          </span>
        </a>
      </div>
    </article>
  );
}
