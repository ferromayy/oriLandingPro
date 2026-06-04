"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CoffeeFormData } from "@/lib/coffees/types";
import { slugify } from "@/lib/coffees/types";

const emptyForm: CoffeeFormData = {
  name: "",
  slug: "",
  codename: "",
  tasting_notes: "",
  description: "",
  price_250g: 0,
  price_1000g: null,
  image_url: "",
  sold_out: false,
  is_active: true,
  sort_order: 0,
};

type Props = {
  mode: "create" | "edit";
  coffeeId?: string;
  initialData?: CoffeeFormData;
};

export function CoffeeForm({ mode, coffeeId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CoffeeFormData>(initialData ?? emptyForm);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CoffeeFormData>(
    key: K,
    value: CoffeeFormData[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al subir imagen");
      updateField("image_url", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      if (!res.ok) throw new Error(data.message ?? "Error al guardar");
      router.push("/admin/coffees");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre *">
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Slug (URL) *">
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Codename (ej. FRUTO)">
          <input
            value={form.codename}
            onChange={(e) => updateField("codename", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Orden en grilla">
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => updateField("sort_order", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notas de cata *">
        <textarea
          required
          rows={2}
          value={form.tasting_notes}
          onChange={(e) => updateField("tasting_notes", e.target.value)}
          className={inputClass}
          placeholder="Chocolate amargo, cáscara de naranja y frutado"
        />
      </Field>

      <Field label="Descripción extendida (página de producto)">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio 250g (ARS) *">
          <input
            required
            type="number"
            min={0}
            value={form.price_250g || ""}
            onChange={(e) => updateField("price_250g", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Precio 1kg (ARS, opcional)">
          <input
            type="number"
            min={0}
            value={form.price_1000g ?? ""}
            onChange={(e) =>
              updateField(
                "price_1000g",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Imagen">
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-xs text-zinc-500">Subiendo imagen…</p>}
          <input
            value={form.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
            className={inputClass}
            placeholder="/images/products/fruto.png o URL de Supabase Storage"
          />
          {form.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image_url}
              alt="Vista previa"
              className="h-32 w-32 rounded border object-cover"
            />
          )}
        </div>
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.sold_out}
            onChange={(e) => updateField("sold_out", e.target.checked)}
          />
          Sold out
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
          />
          Visible en la landing
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

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
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200";
