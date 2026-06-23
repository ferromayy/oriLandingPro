# Migraciones SQL (Supabase)

Ejecutar en **Supabase → SQL Editor** del proyecto correspondiente (local o producción).

## Orden recomendado

| # | Archivo | Qué hace |
|---|---------|----------|
| 001 | `001_coffees.sql` | Tabla `coffees`, RLS, bucket de imágenes, datos de ejemplo |
| 002 | `002_coffee_images_and_variants.sql` | Galería 3–6 fotos + variantes 150/250/500g |
| 003 | `003_coffee_descriptions.sql` | Descripciones corta y larga |
| 004 | `004_coffee_tech_sheet.sql` | Ficha técnica (origen, varietal, etc.) |
| 005 | `005_education_notes.sql` | Notas de educación |
| 006 | `006_education_note_images.sql` | Imágenes en notas de educación |
| 007 | `007_coffee_extended_content_url.sql` | URL de nota vinculada por café |
| 008 | `008_schema_catch_up.sql` | Ajustes varios si el esquema quedó desfasado |
| 009 | `009_education_note_slug.sql` | Slug en notas de educación |
| 010 | `010_coffee_variant_1kg.sql` | Variante de **1 kg** (1000g) |
| 011 | `011_customer_orders.sql` | Tabla `customer_orders` (pedidos del carrito) |
| 012 | `012_customer_orders_status.sql` | Columna `status` (pendiente / finalizado / cancelado) |
| 013 | `013_customer_orders_order_code.sql` | Columna `order_code` (código fijo desde 1600) |
| 014 | `014_customer_orders_production_catch_up.sql` | **Catch-up idempotente** para pedidos en producción |
| 015 | `015_education_note_source.sql` | Campo `source` (fuente) en notas de educación |
| 016 | `016_education_note_nombre.sql` | Campo `nombre` en notas de educación |
| 017 | `017_education_images_catch_up.sql` | **Catch-up idempotente** educación: tabla `education_note_images`, `source`, `nombre`, `is_primary` |
| 018 | `018_education_note_image_primary.sql` | Imagen principal en notas; marca la primera existente como `is_primary` |
| 019 | `019_coffee_extended_content_catch_text.sql` | Texto personalizado del bloque “Seguí leyendo” en cafés (`extended_content_catch_text`) |
| 020 | `020_education_note_image_inline.sql` | Columna `is_inline` en imágenes de educación (imagen al medio del texto) |
| 021 | `021_education_note_content_parts.sql` | Columnas `content_before_image` y `content_after_image`; migra `content` existente al bloque superior |

## Producción (Vercel)

### Pedidos

Si el checkout por WhatsApp falla con:

> Could not find the 'order_code' column of 'customer_orders' in the schema cache

Ejecutá **solo** el archivo:

```
supabase/migrations/014_customer_orders_production_catch_up.sql
```

Incluye todo lo de pedidos (011 + 012 + 013) y recarga el schema cache con `notify pgrst, 'reload schema'`.

### Educación e imágenes

Si en admin o en `/educacion` faltan columnas (`source`, `nombre`, `is_primary`) o la tabla de imágenes de notas:

```
supabase/migrations/017_education_images_catch_up.sql
```

Luego, si hace falta marcar imágenes principales en datos ya existentes:

```
supabase/migrations/018_education_note_image_primary.sql
```

Para imágenes **al medio del texto** (`is_inline`):

```
supabase/migrations/020_education_note_image_inline.sql
```

Para **dos bloques de contenido** (texto superior / inferior):

```
supabase/migrations/021_education_note_content_parts.sql
```

Tras la 021, el contenido viejo queda en `content_before_image`. Revisá cada nota en admin y mové al campo inferior lo que va después de las imágenes del medio.

También podés ejecutar **015** y **016** por separado si solo faltan esos campos.

### Texto “Seguí leyendo” en cafés

Para habilitar texto personalizado en el formulario de cafés:

```
supabase/migrations/019_coffee_extended_content_catch_text.sql
```

### Schema cache

Si el error persiste tras una migración, en Supabase → **Settings → API** usá **Reload schema** o esperá ~1 minuto.

## Notas

- Las migraciones usan `if not exists` / `add column if not exists` cuando es posible, para poder re-ejecutarlas sin romper.
- El panel admin requiere `SUPABASE_SERVICE_ROLE_KEY` en el servidor (Vercel incluida).
- Después de cada migración en producción, probá `/api/health` y un pedido de prueba desde el carrito.
