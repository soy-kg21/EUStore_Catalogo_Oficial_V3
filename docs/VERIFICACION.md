# Verificación de la versión 2.0
Fecha: 22 de septiembre de 2026.

## Comprobado
- Importación: 253 IDs, SKU y slugs únicos. 251 registros visibles, 2 inactivos, 3 avisos de revisión de color. Stock físico desconocido en 253.
- 502 imágenes de referencias activas, con dos tamaños WebP por foto. Las 4 rutas ausentes corresponden a las 2 referencias inactivas.
- TypeScript sin errores. Compilación Vinext/Cloudflare completada.
- Pruebas del Worker compilado con Miniflare: 251 páginas de producto responden 200; canonical, Open Graph y JSON-LD por registro. 2 productos inactivos responden 404.
- Inicio, catálogo, 3 categorías, ofertas, nosotros, contacto, privacidad, selección, sitemap y robots responden 200.
- Sitemap: 259 entradas, dominio oficial y rutas propias. Robots bloquea indexación en revisión.
- /productos/[slug] redirige con 308 a /producto/[slug].
- API de búsqueda Mary Jane + Marfil retorna un registro. Cotización válida retorna 200, talla inválida y cantidad negativa retornan 400.
- 13 casos de negocio/validación: B1 no incrementa precios, combo 1+1 B5, combo 2+1 B5, 4 prendas mixtas, cantidades mayoristas, separación B1/B2, revisión B2 desde 6 y B5 desde 41, rechazo de talla/cantidad inválidas.
- Navegador de escritorio: inicio, navegación a producto, galería secundaria, falta de talla, selección de talla, enlace WhatsApp con SKU/talla/precio/URL, añadir a selección, resumen recalculado, búsqueda Mary Jane (2 resultados), filtro Marfil (1 resultado).
- No se envió ningún mensaje de WhatsApp ni se realizó un pedido.

## Límites de la comprobación
- Supabase no fue provisionado. SQL, vista y políticas se entregan para ejecutar y probar en staging; no se afirma una migración externa realizada.
- Revisión visual en escritorio. CSS incluye móvil/tablet, pero falta validación en dispositivos reales y navegadores iOS/Android.
- No se midió Lighthouse ni Core Web Vitals. No se atribuyen puntuaciones.
- WebMCP se registra solo cuando está disponible. El navegador de prueba no expuso modelContext; validación de esta interfaz no disponible. La interfaz humana sí fue probada.
- Next.js nativo en Vercel y DNS/TLS del dominio oficial pendientes. La compilación probada corresponde a Vinext/Cloudflare.
- No se ha probado inventario físico, credenciales externas, WhatsApp Cloud API, pagos ni analítica.

Evidencia automática: route-test-results.json y migration-report.json. Repetir después de modificar catálogo o reglas: pruebas comerciales, build y test-routes.mjs. Después de cambios solo visuales: tipos/build y revisar las vistas afectadas.
