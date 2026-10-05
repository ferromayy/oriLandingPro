import Image from "next/image";
import type { AcademiaEvent } from "@/lib/academia/types";
import { buildAcademiaInfoWhatsAppUrl } from "@/lib/site/whatsapp-order";

const CAFE_EN_CASA_TITLE = "TALLER UN BUEN CAFÉ PARA TU CASA";
const FILTRADOS_HANDLE = "@cafesinfiltro";
const FILTRADOS_INSTAGRAM = "https://www.instagram.com/cafesinfiltro_/?hl=es";

function EventTitle({
  title,
  whatsappHref,
}: {
  title: string;
  whatsappHref: string;
}) {
  const handleAt = title.indexOf(FILTRADOS_HANDLE);
  if (handleAt === -1) {
    return (
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
      >
        {title}
      </a>
    );
  }

  const before = title.slice(0, handleAt);
  const after = title.slice(handleAt + FILTRADOS_HANDLE.length);

  return (
    <>
      {before ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
        >
          {before}
        </a>
      ) : null}
      <a
        href={FILTRADOS_INSTAGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-gray-400 underline-offset-4 outline-none transition-colors hover:text-gray-600 focus-visible:ring-1 focus-visible:ring-gray-400"
      >
        {FILTRADOS_HANDLE}
      </a>
      {after ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
        >
          {after}
        </a>
      ) : null}
    </>
  );
}

const FILTRADOS_TITLE_PREFIX = "TALLER DE FILTRADOS AVANZADO";

/** Misma copia que 030_academia_events_details.sql, por si la columna todavía no existe. */
const FILTRADOS_DESCRIPTION = `* Cómo funciona la extracción: solución, soluto y solvente.
* Qué variables afectan la extracción.
* Tipos de extracción: ventajas y desventajas.
* Cómo analizar una taza y detectar qué está fallando.
* Cómo ajustar una receta según el sabor.
* TDS, % de extracción y flujo.
* Agua para café: dureza, alcalinidad y composición.
* Extracción uniforme y migración de finos.
* Cómo lograr mayor consistencia y repetibilidad en nuestros cafés.`;

const CAFE_EN_CASA_DETAILS = {
  subtitle: "10/10/26\n1.ª edición — Baltus Cafetería (Nueva Córdoba)",
  duration: "3 horas",
  description: `Un encuentro para aprender a leer el café antes de prepararlo.

Vamos a conocer qué hay detrás de cada grano: su origen, variedad, proceso y tueste.

También vamos a explorar qué encontramos en la taza y cómo pequeños cambios pueden transformar una preparación.

Sin recetas rígidas: aprender a observar, entender y preparar mejor.`,
};

function withFallbackDetails(event: AcademiaEvent): AcademiaEvent {
  if (typeof event.description === "string") return event;
  if (event.title === CAFE_EN_CASA_TITLE) return { ...event, ...CAFE_EN_CASA_DETAILS };
  if (event.title.startsWith(FILTRADOS_TITLE_PREFIX)) {
    return { ...event, description: FILTRADOS_DESCRIPTION };
  }
  return event;
}

const CAFE_EN_CASA_COMMENT = "Próximamente en la cafetería de tu barrio";

function eventComment(title: string): string {
  if (title === CAFE_EN_CASA_TITLE) return CAFE_EN_CASA_COMMENT;
  return "";
}

function eventCity(): string {
  return "Córdoba capital";
}

function courseEducators(title: string): { heading: string; names: string[] } | null {
  const marker = " POR:";
  const index = title.indexOf(marker);
  if (index === -1) return null;
  const names = title
    .slice(index + marker.length)
    .split(/\s*-\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
  if (names.length === 0) return null;
  return { heading: title.slice(0, index).trim(), names };
}

function cardDetails(subtitle: string): { when: string; place: string } {
  const lines = subtitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { when: "", place: "" };
  const startsWithDate = /^\d{1,2}\/\d{1,2}\/\d{2}/.test(lines[0]);
  if (lines.length > 1 && startsWithDate) {
    return { when: lines[0], place: lines.slice(1).join(" ") };
  }
  return { when: lines.join(" "), place: "" };
}

function EducatorName({ name }: { name: string }) {
  const handleAt = name.indexOf(FILTRADOS_HANDLE);
  if (handleAt === -1) return <span>{name}</span>;
  return (
    <>
      {name.slice(0, handleAt)}
      <a
        href={FILTRADOS_INSTAGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-gray-400 underline-offset-4 outline-none transition-colors hover:text-gray-600 focus-visible:ring-1 focus-visible:ring-gray-400"
      >
        {FILTRADOS_HANDLE}
      </a>
      {name.slice(handleAt + FILTRADOS_HANDLE.length)}
    </>
  );
}

function descriptionLines(description: string) {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const isList = lines.length > 0 && lines.every((line) => /^[*•-]\s+/.test(line));
  return {
    isList,
    lines: isList ? lines.map((line) => line.replace(/^[*•-]\s+/, "")) : lines,
  };
}

function DescriptionCopy({ description }: { description: string }) {
  const { isList, lines } = descriptionLines(description);
  if (isList) {
    return (
      <ul className="space-y-1">
        {lines.map((line) => (
          <li
            key={line}
            className="flex gap-2 text-[13px] font-normal leading-snug text-gray-600"
          >
            <span aria-hidden className="text-gray-400">
              ·
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2.5">
      {lines.map((paragraph) => (
        <p key={paragraph} className="text-sm font-normal leading-relaxed text-gray-600">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

type Props = {
  event: AcademiaEvent;
};

export function AcademiaEventCard({ event: source }: Props) {
  const event = withFallbackDetails(source);
  const whatsappHref = buildAcademiaInfoWhatsAppUrl();
  const description = event.description?.trim() ?? "";
  const educators = courseEducators(event.title);
  const cardTitle = educators?.heading ?? event.title;
  const { when, place } = cardDetails(event.subtitle ?? "");
  const comment = eventComment(event.title);
  const city = eventCity();

  return (
    <article className="group flex h-full flex-col border border-gray-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/40">
      <div className="flex flex-1 flex-col">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="outline-none transition hover:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
        aria-label={`Consultar por WhatsApp: ${event.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className={`object-cover transition duration-500 ${
              description
                ? "[@media(hover:hover)]:group-hover:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-0"
                : "group-hover:scale-[1.02]"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          />
          {description ? (
            <div className="absolute inset-0 hidden overflow-y-auto bg-white px-5 py-3 opacity-0 transition duration-300 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
              <div className="flex min-h-full flex-col justify-center gap-2">
                <h3 className="text-sm font-medium tracking-tight text-gray-900">
                  Descripción
                </h3>
                <DescriptionCopy description={description} />
              </div>
            </div>
          ) : null}
        </div>
      </a>
        <div className="flex flex-1 flex-col px-5 pb-2 pt-5">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            <EventTitle title={cardTitle} whatsappHref={whatsappHref} />
          </h2>
          {when ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-gray-600 outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
            >
              {when}
            </a>
          ) : null}
          {educators ? (
            <div className="mt-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Por
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {educators.names.map((name) => (
                  <li key={name} className="text-sm text-gray-800">
                    <EducatorName name={name} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {place || city || event.duration?.trim() || comment || description ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
          >
          {place ? (
            <p className="mt-3 text-sm text-gray-600">{place}</p>
          ) : null}
          {city ? (
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium text-gray-900">Ubicación: </span>
              {city}
            </p>
          ) : null}
          {event.duration?.trim() ? (
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium text-gray-900">Duración: </span>
              {event.duration.trim()}
            </p>
          ) : null}
          {comment ? (
            <p className="mt-3 text-sm text-gray-600">{comment}</p>
          ) : null}
          {description ? (
            <div className="mt-3 [@media(hover:hover)]:hidden">
              <p className="text-sm font-medium text-gray-900">Descripción</p>
              <div className="mt-2">
                <DescriptionCopy description={description} />
              </div>
            </div>
          ) : null}
          </a>
          ) : null}
        </div>
      </div>

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
