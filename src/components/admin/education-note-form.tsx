"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  FormErrorBanner,
  FormToast,
  fieldHasError,
  inputErrorClass,
  sectionErrorClass,
} from "@/components/admin/form-notifications";
import { EducationContentEditor } from "@/components/admin/education-content-editor";
import { EducationNoteImagesEditor } from "@/components/admin/education-note-images-editor";
import { saveEducationNoteAction } from "@/lib/education/actions";
import {
  slugify,
  type EducationNoteFormData,
} from "@/lib/education/types";
import {
  validateEducationNoteForm,
  type FormValidationIssue,
} from "@/lib/education/schema";

const emptyForm: EducationNoteFormData = {
  title: "",
  slug: "",
  content_before_image: "",
  content_after_image: "",
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Texto superior
              </label>
              <p className="mt-1 mb-2 text-xs text-zinc-500">
                Aparece arriba de la imagen del medio. Si no usás imagen al medio, este
                texto va primero y el inferior continúa debajo.
              </p>
              <EducationContentEditor
                value={form.content_before_image}
                onChange={(content) => updateField("content_before_image", content)}
                noteTitle={form.title}
                hasError={fieldHasError(issues, "content_before_image")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Texto inferior
              </label>
              <p className="mt-1 mb-2 text-xs text-zinc-500">
                Aparece debajo de la imagen del medio. Dejalo vacío si no querés cortar la
                nota en dos partes.
              </p>
              <EducationContentEditor
                value={form.content_after_image}
                onChange={(content) => updateField("content_after_image", content)}
                noteTitle={form.title}
                hasError={fieldHasError(issues, "content_after_image")}
              />
            </div>
          </div>

          <div
            id="education-section-images"
            className={`space-y-4 ${fieldHasError(issues, "images") ? sectionErrorClass : ""}`}
          >
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Imágenes (opcional)
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Portada opcional, al menos una imagen al medio (hasta dos) y al menos dos al
                final.
              </p>
            </div>

            <EducationNoteImagesEditor
              images={form.images}
              onChange={(images) => updateField("images", images)}
              hasError={fieldHasError(issues, "images")}
              onUploadError={(message) =>
                showValidationErrors([{ field: "images", message }])
              }
              onClearError={clearIssues}
            />
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
