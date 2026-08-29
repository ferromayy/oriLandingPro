"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { EducationContentEditor } from "@/components/admin/education-content-editor";
import {
  emptyEducationBlock,
  MAX_EDUCATION_PARAGRAPHS,
  MAX_IMAGES_PER_PARAGRAPH,
  type EducationContentBlock,
} from "@/lib/education/blocks";
import { uploadAdminImageClient } from "@/lib/uploads/upload-client";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/uploads/image-types";

type Props = {
  blocks: EducationContentBlock[];
  onChange: (blocks: EducationContentBlock[]) => void;
  noteTitle?: string;
  hasError?: boolean;
  onUploadError: (message: string) => void;
  onClearError: () => void;
};

export function EducationParagraphsEditor({
  blocks,
  onChange,
  noteTitle,
  hasError = false,
  onUploadError,
  onClearError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [targetBlockIndex, setTargetBlockIndex] = useState<number | null>(null);

  function updateBlock(index: number, next: EducationContentBlock) {
    onClearError();
    onChange(blocks.map((block, i) => (i === index ? next : block)));
  }

  function addParagraph() {
    if (blocks.length >= MAX_EDUCATION_PARAGRAPHS) return;
    onClearError();
    onChange([...blocks, emptyEducationBlock()]);
  }

  function removeParagraph(index: number) {
    if (blocks.length <= 1) return;
    onClearError();
    onChange(blocks.filter((_, i) => i !== index));
  }

  function removeImage(blockIndex: number, imageIndex: number) {
    const block = blocks[blockIndex];
    if (!block) return;
    updateBlock(blockIndex, {
      ...block,
      images: block.images.filter((_, i) => i !== imageIndex),
    });
  }

  async function handleFile(file: File | undefined) {
    if (!file || targetBlockIndex === null) return;
    const block = blocks[targetBlockIndex];
    if (!block) return;
    if (block.images.length >= MAX_IMAGES_PER_PARAGRAPH) {
      onUploadError(`Máximo ${MAX_IMAGES_PER_PARAGRAPH} imágenes por párrafo`);
      return;
    }

    onClearError();
    setUploadingFor(targetBlockIndex);
    try {
      const result = await uploadAdminImageClient(file);
      if (!result.ok) {
        onUploadError(result.message);
        return;
      }
      updateBlock(targetBlockIndex, {
        ...block,
        images: [...block.images, result.url].slice(0, MAX_IMAGES_PER_PARAGRAPH),
      });
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploadingFor(null);
      setTargetBlockIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      className={`space-y-6 ${hasError ? "rounded-lg border border-red-300 bg-red-50/30 p-4" : ""}`}
    >
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Párrafos
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Hasta {MAX_EDUCATION_PARAGRAPHS} párrafos. En cada uno podés escribir texto y
          sumar hasta {MAX_IMAGES_PER_PARAGRAPH} imágenes.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {blocks.map((block, index) => {
        const canAddImage = block.images.length < MAX_IMAGES_PER_PARAGRAPH;
        const uploading = uploadingFor === index;

        return (
          <div
            key={`paragraph-${index}`}
            className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-zinc-800">
                Párrafo {index + 1}
              </h3>
              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParagraph(index)}
                  className="text-xs text-red-700 underline underline-offset-2"
                >
                  Quitar párrafo
                </button>
              )}
            </div>

            <EducationContentEditor
              value={block.text}
              onChange={(text) => updateBlock(index, { ...block, text })}
              noteTitle={noteTitle}
            />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Imágenes del párrafo ({block.images.length}/{MAX_IMAGES_PER_PARAGRAPH})
              </p>

              {block.images.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {block.images.map((url, imageIndex) => (
                    <div
                      key={`${url}-${imageIndex}`}
                      className="rounded-lg border border-zinc-200 bg-white p-2"
                    >
                      <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded bg-zinc-100">
                        <Image
                          src={url}
                          alt={`Párrafo ${index + 1} imagen ${imageIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index, imageIndex)}
                        className="text-xs text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {canAddImage && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setTargetBlockIndex(index);
                    fileInputRef.current?.click();
                  }}
                  className="rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading
                    ? "Subiendo…"
                    : block.images.length === 0
                      ? "¿Añadir imagen a este párrafo?"
                      : "¿Añadir otra imagen?"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {blocks.length < MAX_EDUCATION_PARAGRAPHS ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-4">
          <p className="text-sm text-zinc-700">¿Añadir otro párrafo?</p>
          <p className="mt-1 text-xs text-zinc-500">
            Quedan {MAX_EDUCATION_PARAGRAPHS - blocks.length} disponibles.
          </p>
          <button
            type="button"
            onClick={addParagraph}
            className="mt-3 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
          >
            Sí, añadir párrafo
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          Llegaste al máximo de {MAX_EDUCATION_PARAGRAPHS} párrafos.
        </p>
      )}
    </div>
  );
}
