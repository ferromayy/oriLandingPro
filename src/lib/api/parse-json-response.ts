type ApiJsonBody = {
  ok?: boolean;
  message?: string;
  errors?: string[];
};

export async function parseApiJsonResponse<T extends ApiJsonBody>(
  res: Response,
): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (contentType.includes("application/json") || text.trimStart().startsWith("{")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("Respuesta JSON inválida del servidor");
    }
  }

  if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
    if (res.status === 413) {
      throw new Error(
        "El archivo es demasiado grande para el servidor (máx. ~4 MB). Probá con JPG o una foto más chica.",
      );
    }

    if (res.status === 404) {
      throw new Error(
        "No se encontró la API en el servidor. Verificá que el deploy esté actualizado.",
      );
    }

    throw new Error(
      `Error del servidor (${res.status}). Revisá migraciones SQL en Supabase (015–018) y los logs en Vercel.`,
    );
  }

  throw new Error(text.slice(0, 200) || `Error del servidor (${res.status})`);
}
