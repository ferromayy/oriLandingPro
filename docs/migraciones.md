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
| 014 | `014_customer_orders_production_catch_up.sql` | **Catch-up idempotente** para producción |

## Producción (Vercel)

Si el checkout por WhatsApp falla con:

> Could not find the 'order_code' column of 'customer_orders' in the schema cache

Ejecutá **solo** el archivo:

```
supabase/migrations/014_customer_orders_production_catch_up.sql
```

Incluye todo lo de pedidos (011 + 012 + 013) y recarga el schema cache con `notify pgrst, 'reload schema'`.

Si el error persiste, en Supabase → **Settings → API** usá **Reload schema** o esperá ~1 minuto.

## Notas

- Las migraciones usan `if not exists` / `add column if not exists` cuando es posible, para poder re-ejecutarlas sin romper.
- El panel admin requiere `SUPABASE_SERVICE_ROLE_KEY` en el servidor (Vercel incluida).
- Después de cada migración en producción, probá `/api/health` y un pedido de prueba desde el carrito.
