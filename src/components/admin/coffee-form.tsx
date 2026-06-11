"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  type CoffeeFormData,
  type CoffeeImageForm,
  defaultVariants,
  slugify,
  COFFEE_SIZES_GRAMS,
  formatSizeLabel,
  MAX_COFFEE_IMAGES,
  MIN_COFFEE_IMAGES,
} from "@/lib/coffees/types";
import {
  validateCoffeeForm,
  type FormValidationIssue,
  type FormSection,
} from "@/lib/coffees/schema";
import {
  fieldHasError,
  FormErrorBanner,
  FormToast,
  inputErrorClass,
  sectionErrorClass,
} from "@/components/admin/form-notifications";
import {
  extractEducationSlugFromUrl,
  normalizeExtendedContentUrl,
} from "@/lib/coffees/extended-content";
import { getEducationNotePublicPath } from "@/lib/site/public-url";

export type EducationNoteOption = {
  id: string;
  title: string;
  slug: string;
};

const emptyForm: CoffeeFormData = {
  name: "",
  slug: "",
  codename: "",
  tasting_notes: "",
  short_description: "",
  long_description: "",
  extended_content_url: "",
  origin: "",
  varietal: "",
  beneficio: "",
  altitude: "",
  images: [],
  variants: defaultVariants(),
  is_active: true,
  sort_order: 0,
};

const SECTION_IDS: Record<FormSection, string> = {
  general: "coffee-section-general",
  images: "coffee-section-images",
  variants: "coffee-section-variants",
};

type Props = {
  mode: "create" | "edit";
  coffeeId?: string;
  initialData?: CoffeeFormData;
  educationNotes?: EducationNoteOption[];
};

export function CoffeeForm({
  mode,
  coffeeId,
  initialData,
  educationNotes = [],
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CoffeeFormData>(() =>
    initialData
      ? {
          ...emptyForm,
          ...initialData,
          extended_content_url: normalizeExtendedContentUrl(
            initialData.extended_content_url ?? "",
          ),
        }
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
    const firstSection = nextIssues[0]?.section ?? "general";
    document.getElementById(SECTION_IDS[firstSection])?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function updateField<K extends keyof CoffeeFormData>(
    key: K,
    value: CoffeeFormData[K],
  ) {
    clearIssues();
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function setPrimaryImage(index: number) {
    clearIssues();
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }));
  }

  function removeImage(index: number) {
    clearIssues();
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0] = { ...next[0], is_primary: true };
      }
      return {
        ...prev,
        images: next.map((img, i) => ({ ...img, sort_order: i })),
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
        images: next.map((img, i) => ({ ...img, sort_order: i })),
      };
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    if (form.images.length + files.length > MAX_COFFEE_IMAGES) {
      showValidationErrors([
        {
          field: "images",
          message: `Máximo ${MAX_COFFEE_IMAGES} fotos por café`,
          section: "images",
        },
      ]);
      return;
    }

    setUploading(true);
    clearIssues();

    try {
      const uploaded: CoffeeImageForm[] = [];

      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Error al subir imagen");
        uploaded.push({
          url: data.url,
          sort_order: form.images.length + uploaded.length,
          is_primary: form.images.length === 0 && uploaded.length === 0,
        });
      }

      setForm((prev) => {
        const merged = [...prev.images, ...uploaded].map((img, i) => ({
          ...img,
          sort_order: i,
        }));
        if (!merged.some((img) => img.is_primary) && merged.length > 0) {
          merged[0] = { ...merged[0], is_primary: true };
        }
        return { ...prev, images: merged };
      });
    } catch (err) {
      showValidationErrors([
        {
          field: "images",
          message: err instanceof Error ? err.message : "Error al subir imagen",
          section: "images",
        },
      ]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateVariant(
    sizeGrams: (typeof COFFEE_SIZES_GRAMS)[number],
    patch: Partial<CoffeeFormData["variants"][number]>,
  ) {
    clearIssues();
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.size_grams === sizeGrams ? { ...v, ...patch } : v,
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearIssues();

    const validationIssues = validateCoffeeForm(form);
    if (validationIssues.length > 0) {
      showValidationErrors(validationIssues);
      return;
    }

    setLoading(true);

    const url =
      mode === "create" ? "/api/admin/coffees" : `/api/admin/coffees/${coffeeId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const serverIssues: FormValidationIssue[] = data.errors?.length
          ? data.errors.map((message: string) => ({
              field: "form",
              message,
              section: "general" as FormSection,
            }))
          : [
              {
                field: "form",
                message: data.message ?? "Error al guardar",
                section: "general",
              },
            ];
        showValidationErrors(serverIssues);
        return;
      }

      router.push("/admin/coffees");
      router.refresh();
    } catch {
      showValidationErrors([
        {
          field: "form",
          message: "Error de red. Verificá tu conexión e intentá de nuevo.",
          section: "general",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const imagesMissing = form.images.length < MIN_COFFEE_IMAGES;
  const linkedEducationSlug =
    extractEducationSlugFromUrl(form.extended_content_url ?? "") ?? "";

  return (
    <>
      {showToast && issues.length > 0 && (
        <FormToast issues={issues} onDismiss={dismissToast} />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-zinc-200 bg-white p-6"
        noValidate
      >
        <FormErrorBanner issues={issues} />

        <section
          id={SECTION_IDS.general}
          className={`space-y-4 ${fieldHasError(issues, "name") || fieldHasError(issues, "slug") ? sectionErrorClass : ""}`}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Datos generales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre *" error={fieldHasError(issues, "name")}>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass(fieldHasError(issues, "name"))}
                placeholder="Brasil - Natural"
              />
            </Field>
            <Field label="Slug (URL) *" error={fieldHasError(issues, "slug")}>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(e.target.value));
                }}
                className={inputClass(fieldHasError(issues, "slug"))}
                placeholder="brasil-natural"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Codename (ej. FRUTO)">
              <input
                value={form.codename}
                onChange={(e) => updateField("codename", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Orden en grilla">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => updateField("sort_order", Number(e.target.value))}
                className={inputClass(false)}
              />
            </Field>
          </div>

          <Field
            label="Descripción corta *"
            error={fieldHasError(issues, "short_description")}
          >
            <textarea
              rows={6}
              value={form.short_description}
              onChange={(e) => updateField("short_description", e.target.value)}
              className={inputClass(fieldHasError(issues, "short_description"))}
              placeholder={"Párrafo introductorio (como en oricafe.com.ar).\n\nSepará bloques con una línea en blanco para saltos visuales."}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Texto que se muestra en la ficha del producto. Si vinculás una nota
              de Educación, este párrafo funciona como adelanto.
            </p>
          </Field>

          <Field
            label="Nota de educación vinculada"
            error={fieldHasError(issues, "extended_content_url")}
          >
            <select
              value={linkedEducationSlug}
              onChange={(e) =>
                updateField(
                  "extended_content_url",
                  e.target.value ? getEducationNotePublicPath(e.target.value) : "",
                )
              }
              className={inputClass(fieldHasError(issues, "extended_content_url"))}
            >
              <option value="">Sin nota vinculada</option>
              {educationNotes.map((note) => (
                <option key={note.id} value={note.slug}>
                  {note.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              <strong>Opcional.</strong> El contenido largo va en Admin →
              Educación. Si no vinculás ninguna, el producto se guarda igual y
              solo se muestra la descripción corta.
            </p>
            {linkedEducationSlug && (
              <p className="mt-1 font-mono text-xs text-zinc-500">
                {getEducationNotePublicPath(linkedEducationSlug)}
              </p>
            )}
            {educationNotes.length === 0 && (
              <p className="mt-1 text-xs text-zinc-500">
                Todavía no hay notas en Educación. Podés guardar el café sin
                vincular ninguna.
              </p>
            )}
          </Field>
        </section>

        <section
          className={`space-y-4 ${fieldHasError(issues, "tasting_notes") ? sectionErrorClass : ""}`}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Ficha técnica y notas de cata
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Origen, varietal y notas de cata se muestran en la ficha pública del
              producto.
            </p>
          </div>

          <Field label="Notas de cata *" error={fieldHasError(issues, "tasting_notes")}>
            <textarea
              rows={3}
              value={form.tasting_notes}
              onChange={(e) => updateField("tasting_notes", e.target.value)}
              className={inputClass(fieldHasError(issues, "tasting_notes"))}
              placeholder="Chocolate amargo, cáscara de naranja, frutado"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Separá cada nota con coma. Ej:{" "}
              <span className="font-mono">Jazmín, Limoncillo, Panela</span>
            </p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Origen">
              <input
                value={form.origin}
                onChange={(e) => updateField("origin", e.target.value)}
                className={inputClass(false)}
                placeholder="Colombia, Rio blanco - Tolima"
              />
            </Field>
            <Field label="Varietal">
              <input
                value={form.varietal}
                onChange={(e) => updateField("varietal", e.target.value)}
                className={inputClass(false)}
                placeholder="Gesha"
              />
            </Field>
            <Field label="Beneficio">
              <input
                value={form.beneficio}
                onChange={(e) => updateField("beneficio", e.target.value)}
                className={inputClass(false)}
                placeholder="Honey"
              />
            </Field>
            <Field label="Altitud">
              <input
                value={form.altitude}
                onChange={(e) => updateField("altitude", e.target.value)}
                className={inputClass(false)}
                placeholder="2000 - 2100 msnm"
              />
            </Field>
          </div>
        </section>

        <section
          id={SECTION_IDS.images}
          className={`space-y-4 ${fieldHasError(issues, "images") || imagesMissing ? sectionErrorClass : ""}`}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Fotos ({MIN_COFFEE_IMAGES}–{MAX_COFFEE_IMAGES}) *
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Marcá una como <strong>principal</strong> — es la que se ve en la home.
            </p>
            {imagesMissing && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                Faltan {MIN_COFFEE_IMAGES - form.images.length} foto
                {MIN_COFFEE_IMAGES - form.images.length === 1 ? "" : "s"} (mínimo{" "}
                {MIN_COFFEE_IMAGES})
              </p>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || form.images.length >= MAX_COFFEE_IMAGES}
            onChange={handleImageUpload}
          />
          {uploading && <p className="text-xs text-zinc-500">Subiendo…</p>}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.images.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className={`rounded-lg border p-3 ${
                  img.is_primary ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Foto ${index + 1}`}
                  className="mb-3 aspect-square w-full rounded object-cover"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className={`rounded px-2 py-1 text-xs ${
                      img.is_primary
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {img.is_primary ? "★ Principal" : "Hacer principal"}
                  </button>
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
        </section>

        <section
          id={SECTION_IDS.variants}
          className={`space-y-4 ${fieldHasError(issues, "variants") ? sectionErrorClass : ""}`}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Tamaños y precios *
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              150g, 250g, 500g y 1kg — precio en ARS y disponibilidad por tamaño. Si
              ningún tamaño tiene stock, el producto se muestra como{" "}
              <strong>Sold Out</strong> pero sigue visible en la landing.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Tamaño</th>
                  <th className="px-4 py-3">Precio (ARS)</th>
                  <th className="px-4 py-3">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {form.variants.map((variant) => {
                  const variantError = fieldHasError(
                    issues,
                    `variants.${variant.size_grams}`,
                  );
                  return (
                    <tr
                      key={variant.size_grams}
                      className={`border-t border-zinc-100 ${variantError ? "bg-red-50/40" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatSizeLabel(variant.size_grams)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={variant.price || ""}
                          onChange={(e) =>
                            updateVariant(variant.size_grams, {
                              price: Number(e.target.value),
                            })
                          }
                          className={inputClass(variantError)}
                          placeholder="23000"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variant.is_available}
                            onChange={(e) =>
                              updateVariant(variant.size_grams, {
                                is_available: e.target.checked,
                              })
                            }
                          />
                          En stock
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
          />
          Visible en la landing
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {loading ? "Guardando…" : mode === "create" ? "Crear café" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className={`text-sm font-medium ${error ? "text-red-700" : "text-zinc-700"}`}>
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
    hasError
      ? inputErrorClass
      : "border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200"
  }`;
}
