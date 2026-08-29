"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { EducationNoteImageForm } from "@/lib/education/types";
import { uploadAdminImageClient } from "@/lib/uploads/upload-client";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/uploads/image-types";

type Props = {
  images: EducationNoteImageForm[];
  onChange: (images: EducationNoteImageForm[]) => void;
  hasError?: boolean;
  onUploadError: (message: string) => void;
  onClearError: () => void;
};

export function EducationPrimaryImageEditor({
  images,
  onChange,
  hasError = false,
  onUploadError,
  onClearError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const primary = images.find((image) => image.is_primary) ?? images[0] ?? null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    onClearError();
    setUploading(true);
    try {
      const result = await uploadAdminImageClient(file);
      if (!result.ok) {
        onUploadError(result.message);
        return;
      }
      onChange([
        {
          url: result.url,
          sort_order: 0,
          is_primary: true,
          is_inline: false,
        },
      ]);
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      className={`space-y-3 rounded-lg border p-4 ${
        hasError ? "border-red-300 bg-red-50/40" : "border-zinc-200"
      }`}
    >
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Imagen principal
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Portada opcional de la nota (listado y hero del detalle).
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {primary ? (
        <div className="max-w-sm">
          <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded bg-zinc-100">
            <Image
              src={primary.url}
              alt="Imagen principal"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
            >
              {uploading ? "Subiendo…" : "Cambiar"}
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[16/9] max-w-sm flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
        >
          <span className="text-2xl text-zinc-300">+</span>
          <span className="mt-2 text-xs text-zinc-500">
            {uploading ? "Subiendo…" : "Agregar portada"}
          </span>
        </button>
      )}
    </div>
  );
}
