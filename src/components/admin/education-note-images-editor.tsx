"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  flattenEducationImages,
  partitionEducationImages,
} from "@/lib/education/helpers";
import {
  MAX_EDUCATION_FOOTER_IMAGES,
  MAX_EDUCATION_NOTE_IMAGES,
  MIN_EDUCATION_FOOTER_IMAGES,
  type EducationNoteImageForm,
} from "@/lib/education/types";
import { uploadAdminImageAction } from "@/lib/uploads/actions";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/uploads/image-types";

type Props = {
  images: EducationNoteImageForm[];
  onChange: (images: EducationNoteImageForm[]) => void;
  hasError?: boolean;
  onUploadError: (message: string) => void;
  onClearError: () => void;
};

type ImageZone = "primary" | "inline" | "footer";

function ImageSlot({
  label,
  hint,
  image,
  disabled,
  uploading,
  isPrimary = false,
  onAdd,
  onRemove,
  onMakePrimary,
}: {
  label: string;
  hint?: string;
  image: EducationNoteImageForm | null;
  disabled: boolean;
  uploading: boolean;
  isPrimary?: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onMakePrimary?: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        isPrimary ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
      }`}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
        {isPrimary && (
          <span className="ml-1 normal-case text-zinc-600">· principal</span>
        )}
      </p>
      {hint && <p className="mb-3 text-xs text-zinc-500">{hint}</p>}

      {image ? (
        <>
          <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded bg-zinc-100">
            <Image src={image.url} alt={label} fill className="object-cover" sizes="240px" />
          </div>
          <div className="flex flex-wrap gap-2">
            {onMakePrimary && !isPrimary && (
              <button
                type="button"
                onClick={onMakePrimary}
                className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
              >
                Hacer principal
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
            >
              Quitar
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={onAdd}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-zinc-400 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-2xl text-zinc-300">+</span>
          <span className="mt-2 px-3 text-xs text-zinc-500">
            {uploading ? "Subiendo…" : "Agregar imagen"}
          </span>
        </button>
      )}
    </div>
  );
}

export function EducationNoteImagesEditor({
  images,
  onChange,
  hasError = false,
  onUploadError,
  onClearError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingZone, setPendingZone] = useState<ImageZone | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const { primary, inline, footer } = partitionEducationImages(images);
  const totalCount = images.length;
  const canAddFooter = footer.length < MAX_EDUCATION_FOOTER_IMAGES;

  function commit(
    nextPrimary: EducationNoteImageForm | null,
    nextInline: EducationNoteImageForm | null,
    nextFooter: EducationNoteImageForm[],
  ) {
    onChange(flattenEducationImages(nextPrimary, nextInline, nextFooter));
  }

  function openPicker(zone: ImageZone) {
    setPendingZone(zone);
    fileInputRef.current?.click();
  }

  async function uploadFile(file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    const result = await uploadAdminImageAction(body);
    if (!result.ok) throw new Error(result.message);
    return result.url;
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !pendingZone) return;

    setUploading(true);
    onClearError();

    try {
      const url = await uploadFile(file);
      const image: EducationNoteImageForm = {
        url,
        sort_order: 0,
        is_primary: pendingZone === "primary",
        is_inline: pendingZone === "inline",
      };

      if (pendingZone === "primary") {
        commit(image, inline, footer);
      } else if (pendingZone === "inline") {
        commit(primary, image, footer);
      } else {
        commit(primary, inline, [...footer, image]);
      }
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      setPendingZone(null);
    }
  }

  function addFromUrl() {
    const url = urlDraft.trim();
    if (!url) return;

    if (totalCount >= MAX_EDUCATION_NOTE_IMAGES) {
      onUploadError(`Máximo ${MAX_EDUCATION_NOTE_IMAGES} imágenes por nota`);
      return;
    }

    onClearError();

    const image: EducationNoteImageForm = {
      url,
      sort_order: 0,
      is_primary: !primary,
      is_inline: false,
    };

    if (!primary) {
      commit(image, inline, footer);
    } else if (!inline) {
      commit(primary, image, footer);
    } else if (canAddFooter) {
      commit(primary, inline, [...footer, { ...image, is_primary: false, is_inline: false }]);
    } else {
      onUploadError(`Máximo ${MAX_EDUCATION_FOOTER_IMAGES} imágenes al final`);
      return;
    }

    setUrlDraft("");
  }

  function removeFooter(index: number) {
    commit(
      primary,
      inline,
      footer.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function makePrimaryFromInline() {
    if (!inline) return;
    const newPrimary: EducationNoteImageForm = {
      ...inline,
      is_primary: true,
      is_inline: false,
    };
    const demotedInline = primary
      ? { ...primary, is_primary: false, is_inline: true }
      : null;
    commit(newPrimary, demotedInline, footer);
  }

  function makePrimaryFromFooter(index: number) {
    const picked = footer[index];
    if (!picked) return;

    const newPrimary: EducationNoteImageForm = {
      ...picked,
      is_primary: true,
      is_inline: false,
    };
    const nextFooter = [...footer];

    if (primary) {
      nextFooter[index] = { ...primary, is_primary: false, is_inline: false };
    } else {
      nextFooter.splice(index, 1);
    }

    commit(newPrimary, inline, nextFooter);
  }

  return (
    <div
      className={`space-y-6 ${hasError ? "rounded-lg ring-2 ring-red-300 ring-offset-2" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ImageSlot
          label="Principal"
          hint="Junto al título, arriba de la nota. También podés elegirla con «Hacer principal» en otra imagen."
          image={primary}
          disabled={Boolean(primary)}
          uploading={uploading && pendingZone === "primary"}
          isPrimary={Boolean(primary)}
          onAdd={() => openPicker("primary")}
          onRemove={() => commit(null, inline, footer)}
        />
        <ImageSlot
          label="Al medio del texto"
          hint="Corta la nota a la mitad para que no sea tan larga."
          image={inline}
          disabled={Boolean(inline)}
          uploading={uploading && pendingZone === "inline"}
          onAdd={() => openPicker("inline")}
          onRemove={() => commit(primary, null, footer)}
          onMakePrimary={inline ? makePrimaryFromInline : undefined}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">Al final de la nota</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Mínimo {MIN_EDUCATION_FOOTER_IMAGES}, máximo {MAX_EDUCATION_FOOTER_IMAGES}. Aparecen
              debajo del texto.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-400">
            {totalCount} / {MAX_EDUCATION_NOTE_IMAGES}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {footer.map((image, index) => (
            <div key={`${image.url}-${index}`} className="rounded-lg border border-zinc-200 p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                Final {index + 1}
              </p>
              <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded bg-zinc-100">
                <Image
                  src={image.url}
                  alt={`Imagen final ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => makePrimaryFromFooter(index)}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
                >
                  Hacer principal
                </button>
                <button
                  type="button"
                  onClick={() => removeFooter(index)}
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}

          {canAddFooter && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => openPicker("footer")}
              className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
            >
              <span className="text-2xl text-zinc-300">+</span>
              <span className="mt-2 px-3 text-xs text-zinc-500">
                {uploading && pendingZone === "footer" ? "Subiendo…" : "Agregar al final"}
              </span>
            </button>
          )}
        </div>
      </div>

      {totalCount < MAX_EDUCATION_NOTE_IMAGES && (
        <div className="flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-4">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="education-image-url" className="text-xs text-zinc-400">
              O pegá una URL (se agrega al primer espacio libre)
            </label>
            <input
              id="education-image-url"
              type="text"
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addFromUrl();
                }
              }}
              placeholder="/images/... o https://..."
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addFromUrl}
            disabled={!urlDraft.trim() || uploading}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            Agregar URL
          </button>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Acepta JPG, PNG, WebP y HEIC. Si usás imagen al medio, necesitás al menos{" "}
        {MIN_EDUCATION_FOOTER_IMAGES} al final.
      </p>
    </div>
  );
}
