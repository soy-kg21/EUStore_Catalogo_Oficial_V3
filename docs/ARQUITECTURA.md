# Evolución Urbana Store 2.0 — decisiones previas al desarrollo

## Auditoría y alcance
Fuentes: texto del encargo, 16 documentos DOCX, Excel maestro (9 hojas), código HTML/CSS/JavaScript, manifiesto y fotografías del ZIP, referencia visual. El Excel tiene 253 referencias: 251 activas y 2 inactivas. Tres requieren revisión de color. No hay cantidades físicas verificadas. La imagen es guía de composición, no fuente de precios, reseñas, país o disponibilidad.

Conservar: identidad, SKU e IDs, fotos reales WebP, tallas comerciales, precios COP, WhatsApp 573112231940 y reglas B1/B2/B5. Mejorar: separación de capas, búsqueda, filtros, accesibilidad, carga de imágenes y navegación. Eliminar de la carga inicial: modal de bienvenida, Tailwind por CDN, vídeo obligatorio y scripts globales acoplados. Reconstruir: rutas de producto, SEO servidor, API, importación validada, persistencia y controles de integridad.

El proyecto original tiene una entrada HTML (45 KB), CSS de 165 KB, products.js de 86 KB y seis scripts globales; el ZIP contiene 3.603 entradas y unos 100 MB sin comprimir. No dispone de páginas HTTP individuales por referencia ni backend persistente. Las funciones de precio mezclan estado global y presentación. Los tiempos Lighthouse históricos no se conocen: tamaño no equivale a una medición de rendimiento.

## Decisiones
- Next.js App Router + React + TypeScript: rutas y metadatos por registro, componentes de servidor y límites cliente pequeños. El entorno de revisión Sites ejecuta estas interfaces con Vinext/Cloudflare; no se presenta como un despliegue Vercel de Next.js. Se documenta la salida a Next.js nativo.
- Tailwind compilado y CSS de marca: sin CDN en navegador. Negro #101113, blanco #fff, gris #f1f1ef, plata #c5c8cb; WhatsApp verde reservado a conversión.
- Repositorio de datos separado: snapshot público validado en revisión, adaptador REST Supabase opcional para producción. La API y las páginas consumen el mismo repositorio. Si Supabase se configura y falla, no se oculta con precios antiguos.
- PostgreSQL: categorías, productos, variantes por talla/color, imágenes, inventario por bodega, promociones, SEO y perfiles futuros. RLS limita acceso público a catálogo activo; escrituras administrativas mediante rol de servicio fuera del cliente.
- Sin GSAP/Framer: transiciones CSS suficientes. Sin reseñas inventadas, stock ficticio ni afirmaciones de autenticidad inferidas de marcas en fotos.
- Fotos existentes en tamaños adaptados; almacenamiento CDN local en revisión. Ruta de migración a Supabase Storage/Cloudinary, sin subir a servicios externos no configurados.
- Canónico único https://www.evolucionurbana.store. /producto/[slug] y /categoria/[slug]. Preservar slugs de Excel, redirigir /productos y /categorias al formato elegido.

## Migración
Importador idempotente: lee las 9 hojas; valida IDs, SKU, slugs, precios, tallas y archivos; cruza productos con imágenes, URLs y control operativo. No exporta costos, márgenes ni respuestas internas al navegador. Conserva los inactivos en el registro de migración, fuera del catálogo público. Stock desconocido = null, nunca cero ni disponible. Registra excepciones en informe. Crea semillas SQL transaccionales y snapshot para revisión. La misma importación se repite al actualizar Excel.

## Infraestructura y lanzamiento
Revisión privada en Sites con TLS/CDN. Producción propuesta: Next.js nativo en Vercel y Supabase PostgreSQL/Storage mediante HTTPS. No modificar DNS de la tienda actual durante revisión. Antes del corte: configurar proyecto/variables, ejecutar migración, validar precios y excepciones, importar y verificar conteos, probar dominio/TLS y redirects, ejecutar mediciones reales, guardar respaldo y habilitar indexación. Mantener versión anterior para rollback.

## Fases posteriores
Panel administrativo con autenticación y roles; inventario por talla alimentado por responsables; WhatsApp Cloud API/IA y webhooks verificados; pedidos y pagos idempotentes. En 2.0 WhatsApp es un enlace con mensaje estructurado, no un bot conectado.
