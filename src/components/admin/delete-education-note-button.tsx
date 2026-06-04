"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteEducationNoteButton({
  noteId,
  noteTitle,
}: {
  noteId: string;
  noteTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${noteTitle}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/education/${noteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al eliminar");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "…" : "Eliminar"}
    </button>
  );
}
