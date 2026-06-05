"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo } from "react";
import { getEducationNotePublicPath, getEducationNotePublicUrl } from "@/lib/site/public-url";

type Props = {
  slug: string;
  title: string;
  highlight?: boolean;
};

export function EducationNoteQr({ slug, title, highlight = false }: Props) {
  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return getEducationNotePublicUrl(slug);
    }
    return getEducationNotePublicUrl(
      slug,
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
    );
  }, [slug]);

  const canvasId = `education-note-qr-${slug}`;

  function downloadQr() {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `ori-educacion-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section
      className={`rounded-xl border p-6 ${
        highlight
          ? "border-emerald-300 bg-emerald-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-lg bg-white p-3 shadow-sm">
          <QRCodeCanvas
            id={canvasId}
            value={publicUrl}
            size={180}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#111111"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            QR de la nota
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">{title}</h2>
          {highlight && (
            <p className="mt-2 text-sm text-emerald-800">
              Nota creada. Escaneá o descargá este QR para compartir el enlace
              público.
            </p>
          )}
          <p className="mt-3 break-all font-mono text-xs text-zinc-600">
            {publicUrl}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadQr}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Descargar PNG
            </button>
            <Link
              href={getEducationNotePublicPath(slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Ver nota pública
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
