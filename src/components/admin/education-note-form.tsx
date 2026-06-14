"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  FormErrorBanner,
  FormToast,
  fieldHasError,
  inputErrorClass,
  sectionErrorClass,
} from "@/components/admin/form-notifications";
import {
  MAX_EDUCATION_NOTE_IMAGES,
  slugify,
  type EducationNoteFormData,
  type EducationNoteImageForm,
} from "@/lib/education/types";
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

  function removeImage(index: number) {
    clearIssues();
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .filter((_, i) => i !== index)
        .map((image, i) => ({ ...image, sort_order: i })),
    }));
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

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    if (form.images.length + files.length > MAX_EDUCATION_NOTE_IMAGES) {
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

      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Error al subir imagen");
        uploaded.push({
          url: data.url,
          sort_order: form.images.length + uploaded.length,
        });
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded].map((image, index) => ({
          ...image,
          sort_order: index,
        })),
      }));
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
      const url =
        mode === "create"
          ? "/api/admin/education"
          : `/api/admin/education/${noteId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const data = await res.json();

      if (!res.ok) {
        const apiIssues: FormValidationIssue[] = (data.errors ?? [data.message]).map(
          (message: string, index: number) => ({
            field: index === 0 ? "form" : `form-${index}`,
            message,
          }),
        );
        setIssues(apiIssues);
        setShowToast(true);
        return;
      }

      if (mode === "create" && data.note?.id) {
        router.push(`/admin/education/${data.note.id}/edit?created=1`);
      } else {
        router.push("/admin/education");
      }
      router.refresh();
    } catch (err) {
      setIssues([
        {
          field: "form",
          message: err instanceof Error ? err.message : "Error al guardar",
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
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              rows={10}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                fieldHasError(issues, "content") ? inputErrorClass : "border-zinc-300"
              }`}
              placeholder="Escribí la nota educativa..."
            />
          </div>

          <div
            id="education-section-images"
            className={`space-y-4 ${fieldHasError(issues, "images") ? sectionErrorClass : ""}`}
          >
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Imágenes (opcional, máx. {MAX_EDUCATION_NOTE_IMAGES})
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Podés agregar hasta {MAX_EDUCATION_NOTE_IMAGES} imágenes para
                acompañar la nota en la sección Educación.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading || form.images.length >= MAX_EDUCATION_NOTE_IMAGES}
              onChange={handleImageUpload}
            />
            {uploading && <p className="text-xs text-zinc-500">Subiendo…</p>}

            {form.images.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {form.images.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="rounded-lg border border-zinc-200 p-3"
                  >
                    <div className="relative mb-3 aspect-square w-full overflow-hidden rounded bg-zinc-100">
                      <Image
                        src={image.url}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
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
