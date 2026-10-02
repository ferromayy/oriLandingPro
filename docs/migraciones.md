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
| 022 | `022_coffee_variant_200g.sql` | Variante de **200 g** en `coffee_variants`; crea fila 200g (precio 0, sin stock) en cafés existentes |
| 023 | `023_coffee_producer.sql` | Campo opcional `producer` (productor) en ficha técnica de cafés |
| 024 | `024_customer_orders_source.sql` | Columna `source` en pedidos (`whatsapp` \| `staff`) |
| 025 | `025_coffee_stock_quantity.sql` | Columna `stock_quantity` en cafés (stock interno para operarios) |
| 026 | `026_education_note_section.sql` | Columna `section` en notas (`blog` \| `prepara_en_casa`) |
| 027 | `027_education_note_content_blocks.sql` | Columna `content_blocks` (párrafos JSON con texto + imágenes) |
| 028 | `028_academia_events.sql` | Tabla `academia_events` (imagen + 2 textos ≤30 para Academia) |

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

### Cafés — tamaños y ficha técnica

Para el tamaño **200 g** (admin + checkout):

```
supabase/migrations/022_coffee_variant_200g.sql
```

Para el campo **productor** en la ficha técnica:

```
supabase/migrations/023_coffee_producer.sql
```

Después de la 022, configurá precio y stock de 200g en cada café desde `/admin/coffees`. Si el sitio en producción sigue mostrando sold out con stock solo en 200g, ejecutá la migración **y** hacé redeploy en Vercel.

### Pedidos staff (`source`)

Si al cargar pedidos de operario falla o no se distingue origen WhatsApp vs mostrador:

```
supabase/migrations/024_customer_orders_source.sql
```

### Stock interno (`stock_quantity`)

Si al guardar un café en admin aparece:

> Could not find the 'stock_quantity' column of 'coffees' in the schema cache

Ejecutá:

```
supabase/migrations/025_coffee_stock_quantity.sql
```

Agrega `stock_quantity` (integer ≥ 0, default 0). Es stock **interno** para operarios; **no** controla sold-out en la web pública. Incluye `notify pgrst, 'reload schema'`.

### Educación — secciones Blog / Prepará en casa

**Obligatoria** para que Prepará en casa se persista. Sin esta columna, al guardar la nota vuelve a **Blog**.

Si al guardar falla por `section`, o elegís Prepará en casa y al reabrir aparece Blog:

```
supabase/migrations/026_education_note_section.sql
```

Agrega `section` (`blog` | `prepara_en_casa`, default `blog`) e incluye `notify pgrst, 'reload schema'`.

### Educación — párrafos flexibles (`content_blocks`)

**Obligatoria** para el editor de párrafos con imágenes.

Si al guardar una nota falla por `content_blocks`:

```
supabase/migrations/027_education_note_content_blocks.sql
```

Guarda hasta 10 párrafos con texto e imágenes (0–3 por párrafo). Incluye `notify pgrst, 'reload schema'`.

### Educación — catch-up rápido (026 + 027)

Si estás activando el hub Blog / Prepará en casa y los párrafos en una base ya en producción, ejecutá **en este orden**:

```
supabase/migrations/026_education_note_section.sql
supabase/migrations/027_education_note_content_blocks.sql
```

Luego, en cada nota existente que sea receta, en admin marcá **Prepará en casa** y guardá.

### Academia — eventos

Si al crear un evento de Academia falla la tabla:

```
supabase/migrations/028_academia_events.sql
```

Crea `academia_events` (imagen + título + subtítulo, máx. 30 caracteres c/u) e incluye `notify pgrst, 'reload schema'`.

### Schema cache

Si el error persiste tras una migración, en Supabase → **Settings → API** usá **Reload schema** o esperá ~1 minuto. La migración 024 no incluye notify; tras ejecutarla, recargá el schema a mano si hace falta.

## Notas

- Las migraciones usan `if not exists` / `add column if not exists` cuando es posible, para poder re-ejecutarlas sin romper.
- El panel admin requiere `SUPABASE_SERVICE_ROLE_KEY` en el servidor (Vercel incluida).
- Después de cada migración en producción, probá `/api/health` y un pedido de prueba desde el carrito.
- Uploads de admin: `POST /api/admin/upload` (compresión cliente + `sharp` en servidor). El `bodySizeLimit` de Server Actions (12mb) aplica al guardado JSON de formularios, no al binario de las fotos.
