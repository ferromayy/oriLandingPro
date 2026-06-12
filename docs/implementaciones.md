# Implementaciones — Orí Cafe

Documentación de las funcionalidades agregadas al proyecto que no estaban cubiertas en el README original.

---

## Educación

### Sección pública

- Rutas: `/educacion` (listado) y `/educacion/[slug]` (detalle).
- Flag en `src/lib/site/features.ts`: `EDUCATION_PUBLIC_ENABLED`. Si es `false`, las rutas devuelven 404 y el ítem desaparece del menú.
- El contenido largo vive **solo en Educación**; los cafés tienen descripción corta en la ficha del producto.

### Admin

- Rutas: `/admin/education`, `/admin/education/new`, `/admin/education/[id]/edit`.
- CRUD de notas con título, slug, contenido, imágenes (máx. 3) y orden.
- **QR por nota** (`EducationNoteQr`): en la edición de cada nota se generan QR descargables para:
  - **Producción** — `NEXT_PUBLIC_SITE_URL` (ej. `https://www.oricafe.com.ar`)
  - **Vercel** — `NEXT_PUBLIC_VERCEL_SITE_URL` (si está configurada)
  - **Local** — `NEXT_PUBLIC_LOCAL_SITE_URL` (default `http://localhost:3000`)

### Vínculo café ↔ educación

- En el formulario de café (`coffee-form`) se puede elegir una nota de educación vinculada (`extended_content_url` → `/educacion/{slug}`).
- En el sitio público, el detalle del café muestra un enlace a esa nota si está configurada.
- URLs inválidas se normalizan al cargar (`normalizeExtendedContentUrl` en `src/lib/coffees/extended-content.ts`).

---

## Cafés

### Variantes y tamaños

- Tamaños disponibles: **150g, 250g, 500g y 1kg** (`010_coffee_variant_1kg.sql`).
- Admin: galería de **3–6 fotos** (una principal) y precio/disponibilidad por tamaño.

### Sold out y visibilidad

- Un café puede estar **visible** aunque esté agotado (sold out).
- En el sitio público, si está sold out **no se muestran precios** ni opción de compra.
- En admin se muestra badge **Sold out**; no es obligatorio tener stock en todos los tamaños para publicar.

### Ficha técnica y notas de cata

- Notas de cata en la sección “Ficha técnica y notas de cata” del detalle de producto.
- Campos: origen, varietal, beneficio, altitud, etc.

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

Componente: `src/components/admin/order-actions.tsx`

| Acción | Efecto |
|--------|--------|
| **Finalizar** | `status` → `completed` |
| **Cancelar** | `status` → `cancelled` |
| **Eliminar** | Borra el pedido y renumera los `order_number` posteriores |

API admin: `PATCH /api/admin/orders/[id]` (estado), `DELETE /api/admin/orders/[id]` (eliminar).

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

---

## Mapa de archivos clave

| Área | Archivos |
|------|----------|
| Pedidos — lógica | `src/lib/orders/admin.ts`, `types.ts`, `schema.ts`, `display.ts`, `checkout.ts` |
| Pedidos — API | `src/app/api/orders/route.ts`, `src/app/api/admin/orders/` |
| Pedidos — UI admin | `src/app/admin/(protected)/orders/page.tsx`, `src/components/admin/order-actions.tsx` |
| WhatsApp | `src/lib/site/whatsapp-order.ts` |
| Carrito | `src/components/site/cart-context.tsx`, `cart-drawer.tsx` |
| Educación | `src/lib/education/`, `src/app/(site)/educacion/`, `src/app/admin/(protected)/education/` |
| QR educación | `src/components/admin/education-note-qr.tsx`, `src/lib/site/public-url.ts` |
| Cafés | `src/lib/coffees/`, `src/components/admin/coffee-form.tsx` |
| Features / flags | `src/lib/site/features.ts` |
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

*Última actualización: junio 2026 — incluye pedidos, códigos desde 1600, estados, eliminación con renumeración y catch-up de producción.*
