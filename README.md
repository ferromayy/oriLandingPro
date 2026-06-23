# Orí Cafe — App

Landing y panel admin para [Orí Cafe](https://www.oricafe.com.ar/), con **Next.js 16**, **TypeScript** y **Supabase**.

## Qué incluye

- **Landing pública** — promo bar, header, grilla de cafés, detalle de producto, carrito y checkout por WhatsApp
- **Educación** — notas en `/educacion` (Markdown, texto superior/inferior, imágenes portada/medio/final, fuente/nombre)
- **Panel superadmin** (`/admin`) — cafés, pedidos (con edición de ítems) y educación
- **Pedidos** — registro automático al checkout, códigos desde #1600, gestión en admin
- **Supabase** — cafés, imágenes, variantes, notas de educación, pedidos (migraciones hasta **021**)

## Documentación

Toda la documentación detallada está en **[`docs/`](./docs/README.md)**:

- [Implementaciones](./docs/implementaciones.md) — educación, cafés, carrito, pedidos, deploy
- [Migraciones SQL](./docs/migraciones.md) — orden de migraciones y catch-up de producción

## Setup rápido

### 1. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completa en `.env.local` (ver `.env.local.example` para la lista completa):

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | **Requerida** para admin, pedidos y uploads |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SUPERADMIN_SESSION_SECRET` | Login del panel |
| `NEXT_PUBLIC_SITE_URL` | URL pública (QR, links) |

### 2. Base de datos

En Supabase → **SQL Editor**, ejecutá las migraciones en orden. Ver la guía completa en [`docs/migraciones.md`](./docs/migraciones.md).

Mínimo para desarrollo nuevo:

```
supabase/migrations/001_coffees.sql
supabase/migrations/002_coffee_images_and_variants.sql
… (hasta la última que necesites)
```

Para **producción**, según lo que falte en tu Supabase:

```
supabase/migrations/014_customer_orders_production_catch_up.sql   # pedidos
supabase/migrations/017_education_images_catch_up.sql             # educación + imágenes
supabase/migrations/020_education_note_image_inline.sql           # imagen al medio
supabase/migrations/021_education_note_content_parts.sql          # texto superior/inferior
supabase/migrations/019_coffee_extended_content_catch_text.sql    # texto “Seguí leyendo”
```

Ver detalle en [`docs/migraciones.md`](./docs/migraciones.md).

### 3. Arrancar

```bash
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Panel admin (rutas)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/coffees` | Cafés (galería, variantes 150g–1kg, nota vinculada, texto “Seguí leyendo”) |
| `/admin/orders` | Pedidos del carrito (editar ítems, finalizar, cancelar, eliminar) |
| `/admin/education` | Notas de educación + QR |

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
