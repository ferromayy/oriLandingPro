# Implementaciones — Orí Cafe

Documentación de las funcionalidades agregadas al proyecto que no estaban cubiertas en el README original.

---

## Educación

### Sección pública

- Rutas:
  - `/educacion` — **hub** con **Blog** y **Prepará en casa**
  - `/educacion/blog` — listado de notas del blog
  - `/educacion/prepara-en-casa` — listado de recetas de métodos
  - `/educacion/academia` — **Academia** (eventos con imagen + 2 textos cortos)
  - `/educacion/[slug]` — detalle (compartido; links, QR y “Seguí leyendo” no cambian)
- **Menú:** al pasar el mouse por **Educación** (desktop) se abren dos subsecciones: **Blog y Prepará en casa** (`/educacion`) y **Academia** (`/educacion/academia`). En mobile se expanden al tocar Educación. Meta: `EDUCATION_NAV_BRANCHES` en `src/lib/education/sections.ts`.
- **Academia — eventos:** tabla `academia_events` (migración **`028`**). Cada evento tiene imagen + Texto 1 + Texto 2 (máx. **30** caracteres c/u). Admin: botón **Nuevo evento** en `/admin/education`, formulario en `/admin/education/events/new`. Público: grilla en `/educacion/academia`.
- Cada nota tiene `section`: `blog` \| `prepara_en_casa` (migración **`026_education_note_section.sql`**, obligatoria). Sin ella, Prepará en casa no se persiste y la nota vuelve a Blog.
- Slugs reservados (no usar en notas): `blog`, `prepara-en-casa`, `academia`.
- Flag en `src/lib/site/features.ts`: `EDUCATION_PUBLIC_ENABLED`. Si es `false`, las rutas devuelven 404 y el ítem desaparece del menú.
- El contenido largo vive **solo en Educación**; los cafés tienen descripción corta en la ficha del producto.
- **Layout:** ancho de lectura ampliado (`max-w-[58rem]`) en listado y detalle.
- Constantes/meta: `src/lib/education/sections.ts`. Listados: `EducationNotesList` / `EducationSectionPage`.

#### Contenido (párrafos + Markdown)

- El cuerpo de la nota es una lista de **párrafos** (`content_blocks`), hasta **10** (migración **`027`**, obligatoria para el editor nuevo).
- Cada párrafo tiene:
  - Texto en **Markdown** (mismo editor: negrita, subtítulos, listas, preview).
  - **0 a 3 imágenes** propias.
- En admin: “¿Añadir otro párrafo?” / “¿Añadir imagen a este párrafo?”.
- La **imagen principal** (portada) se mantiene aparte y no cuenta dentro de los párrafos.
- Migración: `027_education_note_content_blocks.sql`.
- Notas viejas (texto superior/inferior + imágenes medio/final) se **reconstruyen** al leer como párrafos.
- `content` / `content_before_image` / `content_after_image` se siguen rellenando al guardar por compatibilidad.

### Admin

- Rutas: `/admin/education`, `/admin/education/new`, `/admin/education/[id]/edit`.
- CRUD con título, slug, **párrafos** (hasta 10, con 0–3 imágenes c/u), **imagen principal**, orden, **nombre**, **fuente**, y al final radios **¿En qué subsección va?** (Blog / Prepará en casa).
- **Editor de párrafos** (`EducationParagraphsEditor`) + portada (`EducationPrimaryImageEditor`).
- Botón **«Sí, añadir párrafo»** hasta el máximo; en cada párrafo se pueden sumar imágenes.
- **Upload de imágenes:** por **`POST /api/admin/upload`** (no por Server Action), con compresión en el cliente (`compress-client.ts` / `upload-client.ts`) y optimización en servidor con `sharp` (`prepare-image.ts`). Acepta HEIC/HEIF.
- Si aparece *Body exceeded 8mb/12mb limit*, es el tope de Server Actions: las fotos deben ir por la API de upload (ya es el flujo actual). Tras cambiar `next.config.ts`, reiniciá `npm run dev`.
- **Validación** (`src/lib/education/schema.ts`):
  - Al menos un párrafo con texto.
  - Máximo 10 párrafos; máximo 3 imágenes por párrafo.
  - Una sola portada.
  - Slugs reservados: `blog`, `prepara-en-casa`.
- **Guardado:** Server Action `saveEducationNoteAction` (JSON de la nota; las URLs de imágenes ya subidas). **No** se omite `section` en silencio: si falta la columna, el guardado falla con mensaje para correr la migración **026**.
- **Importante:** sin la migración **026**, al elegir Prepará en casa la nota vuelve a aparecer como Blog (default). Hay que ejecutar `026_education_note_section.sql` en Supabase.
- **QR por nota** (`EducationNoteQr`): en la edición de cada nota se generan QR descargables para:
  - **Producción** — `NEXT_PUBLIC_SITE_URL` (ej. `https://www.oricafe.com.ar`)
  - **Vercel** — `NEXT_PUBLIC_VERCEL_SITE_URL` (si está configurada)
  - **Local** — `NEXT_PUBLIC_LOCAL_SITE_URL` (default `http://localhost:3000`)

#### Orden en el detalle (`/educacion/[slug]`)

1. Título
2. Portada grande (si existe)
3. Párrafos en orden (texto + hasta 3 imágenes c/u)
4. Nombre y fuente (si existen)

En el **listado**, la portada aparece como miniatura; el extracto usa el texto de todos los párrafos.

#### Notas existentes

Al abrir/editar una nota vieja, el sistema arma párrafos desde el contenido anterior. Al guardar, queda en el formato nuevo (`content_blocks`).

### Vínculo café ↔ educación

- En el formulario de café (`coffee-form`) se puede elegir una nota de educación vinculada (`extended_content_url` → `/educacion/{slug}`).
- En el sitio público, el detalle del café muestra el bloque **“Seguí leyendo”** (`ExtendedContentCatch`) si hay nota vinculada.
- URLs inválidas se normalizan al cargar (`normalizeExtendedContentUrl` en `src/lib/coffees/extended-content.ts`).
- **Texto del bloque “Seguí leyendo”** (solo si hay nota vinculada):
  - **Predefinido** (default): título *Conocé más sobre {nombre del café}* + párrafo fijo de adelanto.
  - **Personalizado:** párrafo propio de hasta **30 palabras** (`extended_content_catch_text` en DB). El título predefinido se mantiene.
  - Validación en formulario y schema (`src/lib/coffees/schema.ts`); contador de palabras en vivo en admin.

---

## Cafés

### Variantes y tamaños

- Tamaños en admin y checkout: **150g, 200g, 250g, 500g y 1kg** (`010_coffee_variant_1kg.sql`, `022_coffee_variant_200g.sql`).
- Constante: `COFFEE_SIZES_GRAMS` en `src/types/database.ts`.
- Admin: galería de **3–6 fotos** (una principal) y precio/disponibilidad **por cada tamaño** en la tabla del formulario.
- Al guardar, las variantes se sincronizan en `coffee_variants` (`src/lib/coffees/admin.ts`).

### Sold out y visibilidad

- Un café puede estar **visible** (`is_active`) aunque esté agotado (sold out).
- **Sold out** = ninguna variante con **precio > 0** y **En stock** activo (`isCoffeeSoldOut` en `src/lib/coffees/helpers.ts`).
- El sitio público lee las variantes **tal como están en la base** (`getAvailableVariants`); no ignora tamaños aunque el deploy sea viejo.
- Si está sold out: badge en grilla/detalle, sin precio visible ni botón de compra.
- En admin: badge **Sold out** si aplica; no hace falta stock en todos los tamaños para publicar.
- **Importante:** si el café es **visible**, marcar solo «En stock» sin precio no alcanza; el formulario valida que cada tamaño en stock tenga precio > 0.

### Productos ocultos (internos)

- Con **Visible en la landing** desmarcado (`is_active = false`), el café no aparece en el catálogo público.
- Validación relajada (`src/lib/coffees/schema.ts`): solo son obligatorios **nombre** y **al menos un precio > 0**.
- Fotos, slug, notas de cata y descripción corta quedan opcionales mientras esté oculto.
- Si el slug viene vacío al guardar, se genera desde el nombre (`slugify` en `src/lib/coffees/admin.ts`).
- Sirve para productos de mostrador / take-order sin publicar en la web.
- Tests: `src/lib/coffees/hidden-coffee-validation.test.ts`.

### Stock interno (`stock_quantity`)

- Columna en `coffees` (migración `025_coffee_stock_quantity.sql`): cantidad para uso de operarios.
- **No** afecta sold-out ni disponibilidad en la landing (eso sigue siendo por variantes).
- Se edita en el formulario de café; se muestra en el listado admin y en el panel de toma de pedidos.
- Si falta la columna en Supabase, al guardar un café aparece el error de schema cache; ver [`migraciones.md`](./migraciones.md).

### Ficha técnica y notas de cata

- Campos en admin: origen, varietal, beneficio, altitud, **productor** (opcional, migración `023_coffee_producer.sql`), notas de cata.
- En el **detalle público** se muestran en la **columna derecha** (panel de compra), debajo del nombre/codename y **antes** de molienda y carrito (`ProductTechAndTasting` en `src/components/site/product-tech-tasting.tsx`).
- Solo se renderizan los campos con texto; productor vacío no se muestra.
- La descripción corta y el bloque “Seguí leyendo” siguen en la sección inferior (`ProductDetailContent`).

### Badge “Lanzamiento”

- El día de `created_at` del café (zona horaria `America/Argentina/Cordoba`) se muestra badge **Lanzamiento** en la grilla y detalle.
- Lógica: `isCoffeeLaunchDay` en `src/lib/coffees/helpers.ts`.

### Banda de marca

- Al final del detalle de producto: componente `OriBrandBand` con imagen `/images/about/nosotros2.png`.

---

## Carrito y checkout por WhatsApp

### Carrito (cliente)

- Estado en `localStorage` con clave `ori-cart-v4` (`src/components/site/cart-context.tsx`).
- Cada ítem guarda: café, tamaño, molienda, cantidad, precio, imagen y **codename**.
- Drawer del carrito (`cart-drawer.tsx`):
  - Botón **Seguir comprando** → `/cafe`
  - Botón **Finalizar compra por WhatsApp**

### Flujo de checkout

1. El usuario confirma en el carrito.
2. `POST /api/orders` registra el pedido en Supabase (`customer_orders`).
3. Se abre WhatsApp (`api.whatsapp.com`) con el mensaje ya armado (incluye código de pedido).

Implementación: `src/lib/orders/checkout.ts` → `createOrderAndOpenWhatsApp`.

### Formato del mensaje WhatsApp

Archivo: `src/lib/site/whatsapp-order.ts`

- Número: `543513053755`
- Alias de pago: `oricafe`
- Estructura del mensaje:
  - `☕ PEDIDO DE CAFÉ`
  - `Pedido #XXXX` (código público, ver sección Pedidos)
  - Ítems numerados con codename, tamaño (`150gr`, `1kg`, etc.), molienda (“Sin molienda” si es grano), cantidad y precio por línea
  - Total en ARS
  - Alias

---

## Pedidos (admin y base de datos)

### Tabla `customer_orders`

| Columna | Descripción |
|---------|-------------|
| `id` | UUID |
| `order_number` | Número de orden **posicional** (1, 2, 3…). Se **renumera** al eliminar pedidos. |
| `order_code` | Código público **fijo** (1600, 1601, 1602…). **No cambia** ni se reutiliza al borrar otros pedidos. |
| `status` | `pending` \| `completed` \| `cancelled` |
| `source` | `whatsapp` (cliente web) \| `staff` (operario en admin). Migración `024`. |
| `items` | JSON con líneas del pedido |
| `total` | Total en centavos/pesos enteros (según convención del proyecto) |
| `whatsapp_message` | Texto exacto del pedido (WhatsApp o comanda staff) |
| `created_at` | Fecha de creación |

Constante del primer código: `ORDER_CODE_START = 1600` en `src/lib/orders/types.ts`.

**Ejemplo:** pedidos con nº 1, 2, 3 y códigos #1600, #1601, #1602. Si se elimina el nº 2, el que era nº 3 pasa a ser **nº 2** pero conserva el código **#1602**.

### Panel admin — Pedidos

- Ruta: `/admin/orders`
- Tabla con: nº orden, código, origen (WhatsApp / Operario), fecha, detalle de ítems, total, acciones.
- Dashboard (`/admin`) muestra contador de pedidos, analytics y enlace.
- **Tomar pedido** (`TakeOrderPanel` en la misma página): el operario arma una comanda con cafés activos (visibles u ocultos con precio), tamaño, molienda y cantidad; se guarda con `source: "staff"`.
- Los pedidos staff llevan marcador `[Cargado por operario Orí]` en el mensaje (`resolveOrderSource` / `withStaffOrderMarker` en `src/lib/orders/types.ts` y `admin.ts`).

### Acciones por pedido

Componentes: `src/components/admin/order-actions.tsx`, `src/components/admin/order-items-editor.tsx`

| Acción | Efecto |
|--------|--------|
| **Editar productos** | Modal para cambiar cantidades, quitar ítems o agregar cafés (tamaño, molienda, cantidad). Recalcula total y mensaje de WhatsApp. |
| **Finalizar** | `status` → `completed` |
| **Cancelar** | `status` → `cancelled` |
| **Eliminar** | Borra el pedido y renumera los `order_number` posteriores |

API admin: `PATCH /api/admin/orders/[id]` acepta `{ status }` **o** `{ items, total }`; `DELETE /api/admin/orders/[id]` elimina el pedido.

### API pública

- `POST /api/orders` — crea pedido desde el carrito (sin auth, `source` default `whatsapp`). Devuelve `order_number`, `order_code` y `whatsapp_message`.
- `POST /api/admin/orders` — crea pedido staff desde take-order (requiere sesión admin; `source: "staff"`).

### Compatibilidad con esquema antiguo

Si en Supabase falta la columna `order_code`, `createCustomerOrder` intenta un insert legacy (solo con `serial` de `order_number`) para no bloquear el checkout. **Igual se recomienda ejecutar la migración 014 en producción** para el admin completo. Para `source` y `stock_quantity`, ver migraciones **024** y **025**.

---

## Deploy y entorno

### Variables relevantes (`.env.local` / Vercel)

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SITE_URL` | URL de producción (QR, links públicos) |
| `NEXT_PUBLIC_VERCEL_SITE_URL` | URL del deploy en Vercel (QR staging) |
| `NEXT_PUBLIC_LOCAL_SITE_URL` | URL local para QR de desarrollo |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin, pedidos, uploads |
| `SUPERADMIN_*` | Login del panel |

### Vercel

- Proyecto de referencia: `ori-landing-pro-gutw` (`https://ori-landing-pro-gutw.vercel.app`).
- El dominio `ori-landing-pro.vercel.app` puede dar 404 si apunta a otro proyecto; el dominio custom debe apuntar al proyecto correcto en Vercel.
- **Importante:** las migraciones SQL deben ejecutarse en el **mismo proyecto Supabase** que usan las variables de Vercel.
- Tras agregar tamaños o columnas nuevas (ej. 200g, `producer`, `section`, `content_blocks`), **redeploy** en Vercel para que admin y sitio público usen el código actualizado.
- `next.config.ts` incluye `serverExternalPackages: ["sharp"]` y `serverActions.bodySizeLimit: "12mb"`.
- Las imágenes del admin se suben por **`POST /api/admin/upload`** (compresión en el cliente + `sharp` en el servidor) para no pegarle al límite de body de Server Actions.
- Migraciones de Educación recientes a no olvidar en el mismo proyecto Supabase de Vercel: **026** (`section`) y **027** (`content_blocks`).

### Desarrollo local (Turbopack)

Si en `npm run dev` aparecen **404 en todas las rutas** o errores de módulos (`@swc/helpers`, React Client Manifest):

1. Puede haber un `package-lock.json` en la carpeta de usuario (`~/`) que confunde a Turbopack.
2. El proyecto fija la raíz en `next.config.ts` (`turbopack.root` y `outputFileTracingRoot`).
3. **Solución:** parar el servidor, borrar `.next` y volver a arrancar:
   ```bash
   rm -rf .next && npm run dev
   ```
4. Opcional: renombrar o eliminar el `package-lock.json` suelto en `~/` si no lo necesitás.

---

## Mapa de archivos clave

| Área | Archivos |
|------|----------|
| Pedidos — lógica | `src/lib/orders/admin.ts`, `types.ts`, `schema.ts`, `display.ts`, `checkout.ts`, `helpers.ts`, `analytics.ts` |
| Pedidos — API | `src/app/api/orders/route.ts`, `src/app/api/admin/orders/` |
| Pedidos — UI admin | `src/app/admin/(protected)/orders/page.tsx`, `src/components/admin/order-actions.tsx`, `order-items-editor.tsx`, `take-order-panel.tsx` |
| WhatsApp | `src/lib/site/whatsapp-order.ts` |
| Carrito | `src/components/site/cart-context.tsx`, `cart-drawer.tsx` |
| Educación | `src/lib/education/`, `src/app/(site)/educacion/`, `src/app/admin/(protected)/education/` |
| Educación — secciones | `src/lib/education/sections.ts`, `blog/page.tsx`, `prepara-en-casa/page.tsx`, `academia/page.tsx` |
| Educación — menú | `src/components/site/site-header.tsx` (`EDUCATION_NAV_BRANCHES`) |
| Academia — eventos | `src/lib/academia/`, `src/components/admin/academia-event-form.tsx`, `src/app/admin/(protected)/education/events/` |
| Educación — listados | `src/components/site/education-notes-list.tsx`, `education-section-page.tsx` |
| Educación — contenido | `src/lib/education/blocks.ts`, `content.ts`, `markdown.ts`, `src/components/admin/education-content-editor.tsx`, `education-paragraphs-editor.tsx` |
| Educación — imágenes admin | `src/components/admin/education-primary-image-editor.tsx` |
| Educación — media pública | `src/components/site/education-note-media.tsx`, `education-note-body.tsx` |
| QR educación | `src/components/admin/education-note-qr.tsx`, `src/lib/site/public-url.ts` |
| Cafés — detalle público | `src/components/site/product-tech-tasting.tsx`, `extended-content-catch.tsx`, `product-purchase-panel.tsx` |
| Cafés — admin | `src/lib/coffees/`, `src/components/admin/coffee-form.tsx` |
| Cafés — validación oculta | `src/lib/coffees/schema.ts`, `hidden-coffee-validation.test.ts` |
| Uploads admin | `src/lib/uploads/upload-client.ts`, `compress-client.ts`, `prepare-image.ts`, `src/app/api/admin/upload/route.ts` |
| Features / flags | `src/lib/site/features.ts` |
| Config Next.js | `next.config.ts` |
| Migraciones | `supabase/migrations/` (ver [migraciones.md](./migraciones.md)) |

---

## Rutas del admin (resumen)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard + analytics de pedidos |
| `/admin/coffees` | Listado de cafés (incluye stock interno) |
| `/admin/coffees/new` | Alta |
| `/admin/coffees/[id]/edit` | Edición |
| `/admin/orders` | Pedidos + tomar pedido (staff) |
| `/admin/education` | Notas de educación |
| `/admin/education/new` | Nueva nota |
| `/admin/education/[id]/edit` | Edición + QR |

---

*Última actualización: agosto 2026 — Educación (hub Blog / Prepará en casa, párrafos `content_blocks`, uploads por API + compresión), migraciones 026–027 obligatorias para sección y párrafos.*
