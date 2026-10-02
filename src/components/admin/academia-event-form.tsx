"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  FormErrorBanner,
  FormToast,
  fieldHasError,
  inputErrorClass,
} from "@/components/admin/form-notifications";
import { saveAcademiaEventAction } from "@/lib/academia/actions";
import {
  ACADEMIA_TEXT_MAX,
  type AcademiaEventFormData,
} from "@/lib/academia/types";
import {
  validateAcademiaEventForm,
  type FormValidationIssue,
} from "@/lib/academia/schema";
import { uploadAdminImageClient } from "@/lib/uploads/upload-client";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/uploads/image-types";

const emptyForm: AcademiaEventFormData = {
  image_url: "",
  title: "",
  subtitle: "",
  is_active: true,
  sort_order: 0,
};

type Props = {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: AcademiaEventFormData;
};

export function AcademiaEventForm({ mode, eventId, initialData }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AcademiaEventFormData>(() =>
    initialData ? { ...emptyForm, ...initialData } : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [issues, setIssues] = useState<FormValidationIssue[]>([]);
  const [showToast, setShowToast] = useState(false);

  const dismissToast = useCallback(() => setShowToast(false), []);

  function clearIssues() {
    setIssues([]);
    setShowToast(false);
  }

  function updateField<K extends keyof AcademiaEventFormData>(
    key: K,
    value: AcademiaEventFormData[K],
  ) {
    clearIssues();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    clearIssues();
    setUploading(true);
    try {
      const result = await uploadAdminImageClient(file);
      if (!result.ok) {
        setIssues([{ field: "image_url", message: result.message }]);
        setShowToast(true);
        return;
      }
      updateField("image_url", result.url);
    } catch (err) {
      setIssues([
        {
          field: "image_url",
          message: err instanceof Error ? err.message : "Error al subir imagen",
        },
      ]);
      setShowToast(true);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearIssues();

    const validation = validateAcademiaEventForm(form);
    if (!validation.success) {
      setIssues(validation.issues);
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const result = await saveAcademiaEventAction(mode, eventId, validation.data);
      if (!result.ok) {
        setIssues(
          (result.issues ?? [{ field: "form", message: result.message }]).map(
            (issue, index) => ({
              field: issue.field || (index === 0 ? "form" : `form-${index}`),
              message: issue.message,
            }),
          ),
        );
        setShowToast(true);
        return;
      }

      router.push("/admin/education");
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

        <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Imagen
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Se muestra en la sección Academia del sitio.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />

            <div
              className={`mt-3 max-w-sm ${
                fieldHasError(issues, "image_url") ? "rounded-lg ring-1 ring-red-400" : ""
              }`}
            >
              {form.image_url ? (
                <>
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
                    <Image
                      src={form.image_url}
                      alt="Evento academia"
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {uploading ? "Subiendo…" : "Cambiar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("image_url", "")}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
                >
                  <span className="text-2xl text-zinc-300">+</span>
                  <span className="mt-2 text-xs text-zinc-500">
                    {uploading ? "Subiendo…" : "Añadir imagen"}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Texto 1
            </label>
            <input
              type="text"
              maxLength={ACADEMIA_TEXT_MAX}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                fieldHasError(issues, "title") ? inputErrorClass : "border-zinc-300"
              }`}
              placeholder="Ej. Taller de filtrados"
            />
            <p className="mt-1 text-xs text-zinc-500">
              {form.title.length}/{ACADEMIA_TEXT_MAX} caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Texto 2
            </label>
            <input
              type="text"
              maxLength={ACADEMIA_TEXT_MAX}
              value={form.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                fieldHasError(issues, "subtitle")
                  ? inputErrorClass
                  : "border-zinc-300"
              }`}
              placeholder="Ej. Sábado 12 — Córdoba"
            />
            <p className="mt-1 text-xs text-zinc-500">
              {form.subtitle.length}/{ACADEMIA_TEXT_MAX} caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Posición
            </label>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) =>
                updateField("sort_order", Math.max(0, Number(e.target.value) || 0))
              }
              className={`mt-1 w-full max-w-[10rem] rounded-lg border px-3 py-2 text-sm ${
                fieldHasError(issues, "sort_order")
                  ? inputErrorClass
                  : "border-zinc-300"
              }`}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Menor número = aparece primero en Academia.
            </p>
          </div>

          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
                className="rounded border-zinc-300"
              />
              Visible en Academia
            </span>
            <span className="pl-6 text-xs text-zinc-500">
              {form.is_active
                ? "Se muestra en /educacion/academia."
                : "Queda guardado, pero no se ve en el sitio todavía."}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {loading
              ? "Guardando…"
              : mode === "create"
                ? "Crear evento"
                : "Guardar cambios"}
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
