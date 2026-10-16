# Anime Shop Experience — Integración 07/10/2026

## Alcance
Se añadió una experiencia aislada para la línea Camisetas Anime 180g sin modificar el catálogo existente, el carrito principal, la base de productos actual, el header, el footer ni los estilos globales.

## Ruta nueva
- `/anime`: landing comercial, buscador, filtros, galería, selección múltiple y envío a WhatsApp.
- `/anime/[slug]`: detalle individual, talla, referencia, selección y WhatsApp.

## Activos
- 207 imágenes del proveedor normalizadas a WebP.
- Referencias `EU-ANIME-001` a `EU-ANIME-207`.
- Carpeta: `public/anime/products/`.
- Mapa origen/referencia: `data/anime-image-map.csv`.
- Fuente de productos: `data/anime-products.ts`.

## Archivos nuevos
- `app/anime/page.tsx`
- `app/anime/loading.tsx`
- `app/anime/[slug]/page.tsx`
- `components/anime/AnimeShopClient.tsx`
- `components/anime/AnimeProductDetail.tsx`
- `components/anime/anime.module.css`
- `data/anime-products.ts`
- `data/anime-image-map.csv`
- `public/anime/products/*`

## Archivo existente modificado
- `app/sitemap.ts`: agrega `/anime` y las rutas de detalle Anime.

## Validaciones ejecutadas
- 207 productos / 207 IDs únicos / 207 slugs únicos.
- 207 imágenes referenciadas y 0 imágenes faltantes.
- TypeScript validado con `tsconfig.verify.json`, excluyendo únicamente `build/` porque ese archivo auxiliar ya presenta errores TypeScript previos ajenos al módulo Anime.
- No fue posible ejecutar `next build` en el contenedor porque el `node_modules` incluido en el ZIP corresponde a Windows y no contiene el binario SWC de Linux; el entorno tampoco tiene acceso a npm para descargarlo. Este problema es del entorno de validación, no de la integración Anime.

## Comercial
- La página comunica 1 unidad a $68.000 y 2 por $99.000*.
- El asterisco identifica la promoción como exclusiva de campañas Meta Ads autorizadas y sujeta a cobertura.
- El cliente puede guardar múltiples referencias y enviarlas juntas a WhatsApp.
- El detalle permite seleccionar talla y genera un mensaje con referencia exacta.
- Se advierte que la publicación no confirma stock.

## Despliegue
Mantén tu `.env.local` actual. No se requiere ninguna variable nueva para este módulo.
