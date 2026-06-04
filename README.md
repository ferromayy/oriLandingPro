# Orí Cafe — App

Landing y panel admin para [Orí Cafe](https://www.oricafe.com.ar/), con **Next.js 16**, **TypeScript** y **Supabase**.

## Qué incluye

- **Landing pública** con la estética del sitio actual (promo bar, header, grilla de cafés, carrito WhatsApp)
- **Páginas de producto** (`/producto/[slug]`)
- **Panel superadmin** (`/admin`) para crear, editar y eliminar cafés
- **Base de datos Supabase** con tabla `coffees` + storage para imágenes

## Setup rápido

### 1. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completa en `.env.local`:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | **Requerida** para el admin (CRUD + uploads) |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SUPERADMIN_SESSION_SECRET` | Login del panel |

### 2. Base de datos

En Supabase → **SQL Editor**, ejecuta el archivo:

```
supabase/migrations/001_coffees.sql
```

Eso crea la tabla `coffees`, políticas RLS, bucket `coffee-images` y **5 cafés de ejemplo** con las imágenes ya incluidas en `/public/images/products`.

Luego ejecuta también:

```
supabase/migrations/002_coffee_images_and_variants.sql
```

Eso agrega **galería de fotos** (3–6 por café, una principal) y **precios por tamaño** (150g, 250g, 500g).

### 3. Arrancar

```bash
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Panel admin

Rutas:

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/coffees` | Listado de cafés |
| `/admin/coffees/new` | Alta de café |
| `/admin/coffees/[id]/edit` | Edición |

Campos por café: nombre, slug, codename, notas de cata, descripción, **3–6 fotos** (una principal), **precios y stock por 150g / 250g / 500g**, visible, orden.

Imágenes: subí un archivo (va a Supabase Storage) o pegá una URL / ruta local (`/images/products/...`).

## Imágenes incluidas

Ya descargadas del sitio original en:

- `public/images/brand/logo.png`
- `public/images/products/*.png`

Si tenés versiones en mejor calidad (logo, fotos de producto, favicon), reemplazalas ahí o subilas desde el admin.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
