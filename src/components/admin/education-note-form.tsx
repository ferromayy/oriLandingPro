"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  FormErrorBanner,
  FormToast,
  fieldHasError,
  inputErrorClass,
  sectionErrorClass,
} from "@/components/admin/form-notifications";
import { EducationContentEditor } from "@/components/admin/education-content-editor";
import { saveEducationNoteAction } from "@/lib/education/actions";
import { uploadAdminImageAction } from "@/lib/uploads/actions";
import {
  MAX_EDUCATION_NOTE_IMAGES,
  slugify,
  type EducationNoteFormData,
  type EducationNoteImageForm,
} from "@/lib/education/types";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/uploads/image-types";
import {
  validateEducationNoteForm,
  type FormValidationIssue,
} from "@/lib/education/schema";

const emptyForm: EducationNoteFormData = {
  title: "",
  slug: "",
  content: "",
  source: "",
  nombre: "",
  images: [],
  is_active: true,
  sort_order: 0,
};

type Props = {
  mode: "create" | "edit";
  noteId?: string;
  initialData?: EducationNoteFormData;
};

export function EducationNoteForm({ mode, noteId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EducationNoteFormData>(() =>
    initialData
      ? { ...emptyForm, ...initialData, slug: initialData.slug ?? "" }
      : emptyForm,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issues, setIssues] = useState<FormValidationIssue[]>([]);
  const [showToast, setShowToast] = useState(false);

  const dismissToast = useCallback(() => setShowToast(false), []);

  function clearIssues() {
    setIssues([]);
    setShowToast(false);
  }

  function showValidationErrors(nextIssues: FormValidationIssue[]) {
    setIssues(nextIssues);
    setShowToast(true);
  }

  function updateField<K extends keyof EducationNoteFormData>(
    key: K,
    value: EducationNoteFormData[K],
  ) {
    clearIssues();
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function setPrimaryImage(index: number) {
    clearIssues();
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((image, i) => ({
        ...image,
        is_primary: i === index,
      })),
    }));
  }

  function removeImage(index: number) {
    clearIssues();
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((image) => image.is_primary)) {
        next[0] = { ...next[0], is_primary: true };
      }
      return {
        ...prev,
        images: next.map((image, i) => ({ ...image, sort_order: i })),
      };
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;

    setForm((prev) => {
      const next = [...prev.images];
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...prev,
        images: next.map((image, i) => ({ ...image, sort_order: i })),
      };
    });
  }

  function appendImages(newImages: EducationNoteImageForm[]) {
    setForm((prev) => {
      const remaining = MAX_EDUCATION_NOTE_IMAGES - prev.images.length;
      const toAdd = newImages.slice(0, remaining);
      if (toAdd.length === 0) return prev;

      const merged = [...prev.images, ...toAdd].map((image, index) => ({
        ...image,
        sort_order: index,
      }));

      if (!merged.some((image) => image.is_primary) && merged.length > 0) {
        merged[0] = { ...merged[0], is_primary: true };
      }

      return { ...prev, images: merged };
    });
  }

  function addImageFromUrl() {
    const url = imageUrlDraft.trim();
    if (!url) return;

    if (form.images.length >= MAX_EDUCATION_NOTE_IMAGES) {
      showValidationErrors([
        {
          field: "images",
          message: `Máximo ${MAX_EDUCATION_NOTE_IMAGES} imágenes por nota`,
        },
      ]);
      return;
    }

    clearIssues();
    appendImages([
      {
        url,
        sort_order: form.images.length,
        is_primary: form.images.length === 0,
      },
    ]);
    setImageUrlDraft("");
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const remaining = MAX_EDUCATION_NOTE_IMAGES - form.images.length;
    if (remaining <= 0) {
      showValidationErrors([
        {
          field: "images",
          message: `Máximo ${MAX_EDUCATION_NOTE_IMAGES} imágenes por nota`,
        },
      ]);
      return;
    }

    setUploading(true);
    clearIssues();

    try {
      const uploaded: EducationNoteImageForm[] = [];

      for (const file of Array.from(files).slice(0, remaining)) {
        const body = new FormData();
        body.append("file", file);
        const result = await uploadAdminImageAction(body);
        if (!result.ok) {
          throw new Error(result.message);
        }
        uploaded.push({
          url: result.url,
          sort_order: form.images.length + uploaded.length,
          is_primary: form.images.length === 0 && uploaded.length === 0,
        });
      }

      appendImages(uploaded);
    } catch (err) {
      showValidationErrors([
        {
          field: "images",
          message: err instanceof Error ? err.message : "Error al subir imagen",
        },
      ]);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const imageSlotsRemaining = MAX_EDUCATION_NOTE_IMAGES - form.images.length;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearIssues();

    const validation = validateEducationNoteForm(form);
    if (!validation.success) {
      setIssues(validation.issues);
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const result = await saveEducationNoteAction(mode, noteId, validation.data);

      if (!result.ok) {
        const apiIssues: FormValidationIssue[] = (
          result.issues ?? [{ field: "form", message: result.message }]
        ).map((issue, index) => ({
          field: issue.field || (index === 0 ? "form" : `form-${index}`),
          message: issue.message,
        }));
        setIssues(apiIssues);
        setShowToast(true);
        return;
      }

      if (mode === "create") {
        router.push(`/admin/education/${result.noteId}/edit?created=1`);
      } else {
        router.push("/admin/education");
      }
      router.refresh();
    } catch (err) {
      setIssues([
        {
          field: "form",
          message:
            err instanceof Error
              ? err.message.includes("Server")
                ? `Falló el guardado en el servidor: ${err.message}. Probá sin imágenes o recargá la página.`
                : err.message
              : "Error al guardar",
        },
      ]);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FormToast issues={issues} onDismiss={dismissToast} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {issues.length > 0 && <FormErrorBanner issues={issues} />}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Título
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                fieldHasError(issues, "title") ? inputErrorClass : "border-zinc-300"
              }`}
              placeholder="Ej. Métodos de preparación"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Slug (URL)
            </label>
            <input
              type="text"
              value={form.slug ?? ""}
              onChange={(e) => {
                setSlugTouched(true);
                updateField("slug", slugify(e.target.value));
              }}
              className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm ${
                fieldHasError(issues, "slug") ? inputErrorClass : "border-zinc-300"
              }`}
              placeholder="metodos-de-filtrado"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Aparece en la URL:{" "}
              <code className="rounded bg-zinc-100 px-1">
                /educacion/{form.slug || "tu-slug"}
              </code>
              . Elegilo una vez y no lo cambies si querés preservar links
              externos.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Contenido
            </label>
            <div className="mt-1">
              <EducationContentEditor
                value={form.content}
                onChange={(content) => updateField("content", content)}
                hasError={fieldHasError(issues, "content")}
              />
            </div>
          </div>

          <div
            id="education-section-images"
            className={`space-y-4 ${fieldHasError(issues, "images") ? sectionErrorClass : ""}`}
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Imágenes (opcional)
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Hasta {MAX_EDUCATION_NOTE_IMAGES} imágenes. Marcá una como{" "}
                  <strong>principal</strong> — aparece junto al título en el sitio.
                  Acepta JPG, PNG, WebP y HEIC.
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                {form.images.length} / {MAX_EDUCATION_NOTE_IMAGES}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              multiple
              className="hidden"
              disabled={uploading || imageSlotsRemaining <= 0}
              onChange={handleImageUpload}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: MAX_EDUCATION_NOTE_IMAGES }).map((_, slotIndex) => {
                const image = form.images[slotIndex];

                if (image) {
                  return (
                    <div
                      key={`${image.url}-${slotIndex}`}
                      className={`rounded-lg border p-3 ${
                        image.is_primary
                          ? "border-zinc-900 ring-1 ring-zinc-900"
                          : "border-zinc-200"
                      }`}
                    >
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                        Imagen {slotIndex + 1}
                        {image.is_primary && (
                          <span className="ml-1 normal-case text-zinc-600">· principal</span>
                        )}
                      </p>
                      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded bg-zinc-100">
                        <Image
                          src={image.url}
                          alt={`Imagen ${slotIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(slotIndex)}
                          className={`rounded px-2 py-1 text-xs ${
                            image.is_primary
                              ? "bg-zinc-900 text-white"
                              : "border border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          {image.is_primary ? "★ Principal" : "Hacer principal"}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(slotIndex, -1)}
                          disabled={slotIndex === 0}
                          className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(slotIndex, 1)}
                          disabled={slotIndex === form.images.length - 1}
                          className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(slotIndex)}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={`empty-slot-${slotIndex}`}
                    type="button"
                    disabled={uploading || slotIndex !== form.images.length}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 text-center transition hover:border-zinc-400 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-2xl text-zinc-300">+</span>
                    <span className="mt-2 text-xs text-zinc-500">
                      {slotIndex === form.images.length
                        ? uploading
                          ? "Subiendo…"
                          : "Agregar imagen"
                        : `Imagen ${slotIndex + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {imageSlotsRemaining > 0 && (
              <div className="flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-4">
                <div className="min-w-[200px] flex-1">
                  <label
                    htmlFor="education-image-url"
                    className="text-xs text-zinc-400"
                  >
                    O pegá una URL de imagen
                  </label>
                  <input
                    id="education-image-url"
                    type="text"
                    value={imageUrlDraft}
                    onChange={(e) => setImageUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImageFromUrl();
                      }
                    }}
                    placeholder="/images/... o https://..."
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addImageFromUrl}
                  disabled={!imageUrlDraft.trim() || uploading}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
                >
                  Agregar URL
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Orden
              </label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) =>
                  updateField("sort_order", Number(e.target.value) || 0)
                }
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                  fieldHasError(issues, "sort_order")
                    ? inputErrorClass
                    : "border-zinc-300"
                }`}
              />
              <p className="mt-1 text-xs text-zinc-500">
                Menor número = aparece primero en la sección Educación.
              </p>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  className="rounded border-zinc-300"
                />
                Publicada en el sitio
              </label>
            </div>
          </div>

          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <div>
              <label htmlFor="education-nombre" className="text-xs text-zinc-400">
                Nombre <span className="text-zinc-300">(opcional)</span>
              </label>
              <input
                id="education-nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                className={`mt-1 w-full border-0 border-b bg-transparent px-0 py-1 text-xs text-zinc-500 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-0 ${
                  fieldHasError(issues, "nombre")
                    ? "border-red-300"
                    : "border-zinc-200"
                }`}
                placeholder="Ej. autor o referencia"
              />
            </div>

            <div>
              <label htmlFor="education-source" className="text-xs text-zinc-400">
                Fuente <span className="text-zinc-300">(opcional)</span>
              </label>
              <input
                id="education-source"
                type="text"
                value={form.source}
                onChange={(e) => updateField("source", e.target.value)}
                className={`mt-1 w-full border-0 border-b bg-transparent px-0 py-1 text-xs text-zinc-500 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-0 ${
                  fieldHasError(issues, "source")
                    ? "border-red-300"
                    : "border-zinc-200"
                }`}
                placeholder="Ej. libro, artículo o referencia"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {loading ? "Guardando…" : mode === "create" ? "Crear nota" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/education")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
