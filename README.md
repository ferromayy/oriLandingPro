# Orí Cafe — App

Landing y panel admin para [Orí Cafe](https://www.oricafe.com.ar/), con **Next.js 16**, **TypeScript** y **Supabase**.

## Qué incluye

- **Landing pública** — promo bar, header, grilla de cafés, detalle de producto, carrito y checkout por WhatsApp
- **Educación** — notas en `/educacion` (activable con flag)
- **Panel superadmin** (`/admin`) — cafés, pedidos y educación
- **Pedidos** — registro automático al checkout, códigos desde #1600, gestión en admin
- **Supabase** — cafés, imágenes, variantes, notas de educación, pedidos

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

Para **producción** con pedidos, usá el catch-up:

```
supabase/migrations/014_customer_orders_production_catch_up.sql
```

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
| `/admin/coffees` | Cafés (galería, variantes 150g–1kg) |
| `/admin/orders` | Pedidos del carrito |
| `/admin/education` | Notas de educación + QR |

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
