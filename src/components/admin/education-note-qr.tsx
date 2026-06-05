"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo } from "react";
import {
  getEducationNotePublicPath,
  getEducationNoteQrTargets,
} from "@/lib/site/public-url";

type Props = {
  slug: string;
  title: string;
  highlight?: boolean;
};

function downloadQr(canvasId: string, filename: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function EducationNoteQr({ slug, title, highlight = false }: Props) {
  const targets = useMemo(() => getEducationNoteQrTargets(slug), [slug]);
  const vercelConfigured = Boolean(process.env.NEXT_PUBLIC_VERCEL_SITE_URL?.trim());

  return (
    <section
      className={`rounded-xl border p-6 ${
        highlight
          ? "border-emerald-300 bg-emerald-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          QR de la nota
        </p>
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {highlight && (
          <p className="text-sm text-emerald-800">
            Nota creada. Descargá el QR según dónde la vayas a compartir.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {targets.map((target) => {
          const canvasId = `education-note-qr-${slug}-${target.id}`;

          return (
            <article
              key={target.id}
              className="flex flex-col rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900">{target.label}</h3>
                <p className="text-xs text-zinc-500">{target.description}</p>
              </div>

              <div className="mx-auto my-4 rounded-lg bg-white p-2 shadow-sm">
                <QRCodeCanvas
                  id={canvasId}
                  value={target.url}
                  size={140}
                  level="M"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>

              <p className="min-h-[2.5rem] break-all font-mono text-[10px] leading-relaxed text-zinc-600">
                {target.url}
              </p>

              <button
                type="button"
                onClick={() =>
                  downloadQr(canvasId, `ori-educacion-${slug}-${target.id}.png`)
                }
                className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-50"
              >
                Descargar PNG
              </button>
            </article>
          );
        })}

        {!vercelConfigured && (
          <article className="flex flex-col justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Vercel</h3>
            <p className="mt-2 text-xs text-zinc-600">
              Cuando despliegues en Vercel, agregá en{" "}
              <code className="rounded bg-white px-1">.env.local</code>:
            </p>
            <p className="mt-2 break-all font-mono text-[10px] text-zinc-700">
              NEXT_PUBLIC_VERCEL_SITE_URL=https://tu-proyecto.vercel.app
            </p>
          </article>
        )}
      </div>

      <div className="mt-6">
        <Link
          href={getEducationNotePublicPath(slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          Ver nota pública (ruta relativa)
        </Link>
      </div>
    </section>
  );
}
