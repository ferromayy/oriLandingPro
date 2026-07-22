/** Sección Educación visible en el sitio público (menú y páginas /educacion). */
export const EDUCATION_PUBLIC_ENABLED = true;

/** Destino público del menú/footer de Suscripciones (app externa). */
export const SUBSCRIPTIONS_JOIN_URL =
  "https://suscripciones.oricafe.com.ar/app/ori/join";

/**
 * Página interna `/suscripciones`: queda en el repo pero oculta para el usuario.
 * En local (`npm run dev`) se puede abrir la URL a mano para previsualizar.
 * En producción da 404. No se linkea desde el menú.
 */
export const SUBSCRIPTIONS_PUBLIC_ENABLED =
  process.env.NODE_ENV === "development";
