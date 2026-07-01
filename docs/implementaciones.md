# Implementaciones — Orí Cafe

Documentación de las funcionalidades agregadas al proyecto que no estaban cubiertas en el README original.

---

## Educación

### Sección pública

- Rutas: `/educacion` (listado) y `/educacion/[slug]` (detalle).
- Flag en `src/lib/site/features.ts`: `EDUCATION_PUBLIC_ENABLED`. Si es `false`, las rutas devuelven 404 y el ítem desaparece del menú.
- El contenido largo vive **solo en Educación**; los cafés tienen descripción corta en la ficha del producto.
- **Layout:** ancho de lectura ampliado (`max-w-[58rem]`) en listado y detalle.

#### Contenido (Markdown)

- El texto se escribe en **Markdown** (`react-markdown` + `remark-gfm` + `remark-breaks`).
- En admin hay **dos campos de texto** para controlar dónde van las imágenes del medio:
  - **Texto superior** (`content_before_image`) — arriba de las imágenes intercaladas.
  - **Texto inferior** (`content_after_image`) — debajo de las imágenes intercaladas.
- Al guardar también se persiste `content` (concatenación de ambos bloques) por compatibilidad.
- `normalizeEducationMarkdown()` quita un `# título` duplicado si coincide con el título de la nota.
- Componentes: `EducationContentEditor` (admin), `EducationNoteContent` (público).

#### Imágenes — roles y límites

| Rol | Columna DB | Cantidad | Dónde se ve |
|-----|------------|----------|-------------|
| **Principal** (portada) | `is_primary` | 0–1 (opcional) | Listado: miniatura junto al título. Detalle: hero grande debajo del título. |
| **Al medio** | `is_inline` | **1–2** (obligatoria al menos 1) | Entre texto superior e inferior. |
| **Al final** (galería) | (ninguna) | **2–4** (obligatorio al menos 2) | Debajo de nombre/fuente. |

Máximo **7 imágenes** por nota (1 + 2 + 4). Constantes en `src/lib/education/types.ts`.

#### Orden en el detalle (`/educacion/[slug]`)

1. Título (`EducationNoteTitleWithImage`, sin miniatura en detalle).
2. Portada grande (`EducationNotePrimaryHero`), si existe.
3. Texto superior (`EducationNoteBody` → `EducationNoteContent`).
4. Imagen(es) al medio (`EducationNoteInlineImage`, 1 o 2).
5. Texto inferior.
6. Nombre y fuente (si existen).
7. Galería final (`EducationNoteGallery`).

En el **listado**, la portada aparece como miniatura junto al título; el extracto usa el contenido completo (`getEducationExcerpt`).

Componentes públicos: `src/components/site/education-note-media.tsx`, `education-note-body.tsx`.

### Admin

- Rutas: `/admin/education`, `/admin/education/new`, `/admin/education/[id]/edit`.
- CRUD con título, slug, **texto superior/inferior**, **fuente** (`source`), **nombre** (`nombre`), imágenes y orden.
- **Editor de imágenes** (`EducationNoteImagesEditor`): tres zonas separadas — portada, medio (Medio 1 obligatorio, Medio 2 opcional), final (mín. 2).
- Botón **«Hacer principal»** para promover otra imagen a portada.
- **Upload:** acepta HEIC/HEIF; conversión a JPG con `sharp` (`src/lib/uploads/prepare-image.ts`).
- **Validación** (`src/lib/education/schema.ts`):
  - Al menos 1 imagen al medio, máximo 2.
  - Al menos 2 imágenes al final, máximo 4.
  - Texto superior obligatorio.
  - Al menos un bloque de texto (superior o inferior).
  - Una sola portada; una imagen no puede ser portada y del medio a la vez.
- **Guardado:** Server Actions (`src/lib/education/actions.ts`, `src/lib/uploads/actions.ts`) para evitar errores HTML/500 en Vercel. Fallback legacy si faltan columnas nuevas en Supabase (`src/lib/education/admin.ts`).
- **QR por nota** (`EducationNoteQr`): en la edición de cada nota se generan QR descargables para:
  - **Producción** — `NEXT_PUBLIC_SITE_URL` (ej. `https://www.oricafe.com.ar`)
  - **Vercel** — `NEXT_PUBLIC_VERCEL_SITE_URL` (si está configurada)
  - **Local** — `NEXT_PUBLIC_LOCAL_SITE_URL` (default `http://localhost:3000`)

#### Notas existentes tras migración 021

Si una nota tenía un solo campo `content`, al migrar todo queda en **texto superior**. Hay que mover manualmente al **texto inferior** la parte que va después de las imágenes del medio.

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
- **Importante:** marcar solo «En stock» sin precio no alcanza; el formulario valida que cada tamaño en stock tenga precio > 0.

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
| `items` | JSON con líneas del pedido |
| `total` | Total en centavos/pesos enteros (según convención del proyecto) |
| `whatsapp_message` | Texto exacto enviado por WhatsApp |
| `created_at` | Fecha de creación |

Constante del primer código: `ORDER_CODE_START = 1600` en `src/lib/orders/types.ts`.

**Ejemplo:** pedidos con nº 1, 2, 3 y códigos #1600, #1601, #1602. Si se elimina el nº 2, el que era nº 3 pasa a ser **nº 2** pero conserva el código **#1602**.

### Panel admin — Pedidos

- Ruta: `/admin/orders`
- Tabla con: nº orden, código, fecha, detalle de ítems, total, acciones.
- Dashboard (`/admin`) muestra contador de pedidos con enlace.

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

- `POST /api/orders` — crea pedido desde el carrito (sin auth). Devuelve `order_number`, `order_code` y `whatsapp_message`.

### Compatibilidad con esquema antiguo

Si en Supabase falta la columna `order_code`, `createCustomerOrder` intenta un insert legacy (solo con `serial` de `order_number`) para no bloquear el checkout. **Igual se recomienda ejecutar la migración 014 en producción** para el admin completo.

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
- Tras agregar tamaños o columnas nuevas (ej. 200g, `producer`), **redeploy** en Vercel para que admin y sitio público usen el código actualizado.
- `next.config.ts` incluye `serverExternalPackages: ["sharp"]` y `serverActions.bodySizeLimit: "8mb"` para uploads de imágenes en admin.

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
| Pedidos — lógica | `src/lib/orders/admin.ts`, `types.ts`, `schema.ts`, `display.ts`, `checkout.ts` |
| Pedidos — API | `src/app/api/orders/route.ts`, `src/app/api/admin/orders/` |
| Pedidos — UI admin | `src/app/admin/(protected)/orders/page.tsx`, `src/components/admin/order-actions.tsx`, `order-items-editor.tsx` |
| WhatsApp | `src/lib/site/whatsapp-order.ts` |
| Carrito | `src/components/site/cart-context.tsx`, `cart-drawer.tsx` |
| Educación | `src/lib/education/`, `src/app/(site)/educacion/`, `src/app/admin/(protected)/education/` |
| Educación — contenido | `src/lib/education/content.ts`, `markdown.ts`, `src/components/admin/education-content-editor.tsx` |
| Educación — imágenes admin | `src/components/admin/education-note-images-editor.tsx` |
| Educación — media pública | `src/components/site/education-note-media.tsx`, `education-note-body.tsx` |
| QR educación | `src/components/admin/education-note-qr.tsx`, `src/lib/site/public-url.ts` |
| Cafés — detalle público | `src/components/site/product-tech-tasting.tsx`, `extended-content-catch.tsx`, `product-purchase-panel.tsx` |
| Cafés — admin | `src/lib/coffees/`, `src/components/admin/coffee-form.tsx` |
| Uploads admin | `src/lib/uploads/prepare-image.ts`, `src/lib/uploads/actions.ts` |
| Features / flags | `src/lib/site/features.ts` |
| Config Next.js | `next.config.ts` |
| Migraciones | `supabase/migrations/` (ver [migraciones.md](./migraciones.md)) |

---

## Rutas del admin (resumen)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/coffees` | Listado de cafés |
| `/admin/coffees/new` | Alta |
| `/admin/coffees/[id]/edit` | Edición |
| `/admin/orders` | Pedidos del carrito |
| `/admin/education` | Notas de educación |
| `/admin/education/new` | Nueva nota |
| `/admin/education/[id]/edit` | Edición + QR |

---

*Última actualización: junio 2026 — cafés (200g, productor opcional, lógica sold out por variantes en DB), educación (texto superior/inferior, imágenes portada/medio/final), migraciones 015–023.*
