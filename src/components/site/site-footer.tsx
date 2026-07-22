import { SUBSCRIPTIONS_JOIN_URL } from "@/lib/site/features";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-gray-50 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-10 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-900">
            Navegación
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a
                href={SUBSCRIPTIONS_JOIN_URL}
                className="hover:text-gray-900"
                rel="noopener noreferrer"
              >
                Suscripciones
              </a>
            </li>
            <li>
              <a href="/mayoristas" className="hover:text-gray-900">
                Mayoristas y asesoramiento
              </a>
            </li>
            <li>
              <a href="/nosotros" className="hover:text-gray-900">
                Nosotros
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-900">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="mailto:oritostadores@gmail.com" className="hover:text-gray-900">
                oritostadores@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/543513053755"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900"
              >
                +54 351 305-3755
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-900">
            Síguenos
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a
                href="https://www.instagram.com/oritostadores_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
