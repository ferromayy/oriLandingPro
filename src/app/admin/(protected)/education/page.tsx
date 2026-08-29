import Link from "next/link";
import { getAllEducationNotesAdmin } from "@/lib/education/admin";
import { getEducationExcerpt } from "@/lib/education/content";
import {
  educationSectionLabel,
  normalizeEducationSection,
} from "@/lib/education/sections";
import { DeleteEducationNoteButton } from "@/components/admin/delete-education-note-button";

export default async function AdminEducationPage() {
  let notes: Awaited<ReturnType<typeof getAllEducationNotesAdmin>> = [];
  let error: string | null = null;

  try {
    notes = await getAllEducationNotesAdmin();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar notas";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Educación</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Notas del Blog y recetas de Prepará en casa.
          </p>
        </div>
        <Link
          href="/admin/education/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          + Nueva nota
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <p className="mt-2 text-xs">
            Ejecutá{" "}
            <code className="rounded bg-white/70 px-1">005_education_notes.sql</code>,{" "}
            <code className="rounded bg-white/70 px-1">006_education_note_images.sql</code>{" "}
            y{" "}
            <code className="rounded bg-white/70 px-1">026_education_note_section.sql</code>{" "}
            en Supabase si aún faltan tablas o la columna de sección.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Sección</th>
              <th className="px-4 py-3">Portada</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => {
              const section = normalizeEducationSection(note.section);
              return (
                <tr key={note.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{note.title}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      /educacion/{note.slug}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {getEducationExcerpt(note, 120)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {educationSectionLabel(section)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                  {note.education_note_images.some((image) => image.is_primary)
                    ? "Con portada"
                    : "Sin portada"}
                </td>
                  <td className="px-4 py-3 text-zinc-600">{note.sort_order}</td>
                  <td className="px-4 py-3">
                    {note.is_active ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] uppercase text-emerald-800">
                        Publicada
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] uppercase text-zinc-700">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/education/${note.id}/edit`}
                        className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <DeleteEducationNoteButton noteId={note.id} noteTitle={note.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {notes.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No hay notas todavía. Creá la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
