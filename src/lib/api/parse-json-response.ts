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
      const data = JSON.parse(text) as T;
      if (!res.ok && data.message) {
        throw new Error(data.message);
      }
      return data;
    } catch (err) {
      if (err instanceof Error && err.message !== "Respuesta JSON inválida del servidor") {
        throw err;
      }
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
      `Error del servidor (${res.status}). Si persiste, revisá migraciones 017–018 en Supabase y redeploy en Vercel.`,
    );
  }

  throw new Error(text.slice(0, 200) || `Error del servidor (${res.status})`);
}
