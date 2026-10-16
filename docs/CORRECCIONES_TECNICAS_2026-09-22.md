# Correcciones técnicas verificadas

Fecha: 22 de septiembre de 2026.

## Alcance

Esta versión conserva el catálogo, las reglas comerciales, la base de datos, el SEO y la estructura funcional recibida. No activa servicios externos, no modifica credenciales, no cambia el dominio oficial y no publica el sitio.

## Correcciones aplicadas

- Carrito: sustitución de actualizaciones de estado síncronas dentro de efectos por una suscripción estable al almacenamiento local.
- Carrito: sincronización entre pestañas y actualización inmediata mediante los eventos `storage` y `eu-cart`.
- Carrito: separación del estado de la cotización por contenido para evitar mostrar precios correspondientes a una selección anterior.
- Imágenes: migración de etiquetas HTML directas al componente de imagen del framework en inicio, tarjetas, detalle y carrito.
- Detalle de producto: dependencias estables del registro WebMCP y función de agregado memorizada.
- Catálogo: corrección de la declaración inmutable detectada por ESLint.
- Compilación Sites: serialización del empaquetado de metadatos para evitar carreras entre los entornos cliente, servidor y RSC.
- Permisos: normalización de directorios de la copia para permitir una compilación reproducible en Linux.

## Verificación ejecutada

- Instalación reproducible con el archivo de bloqueo: correcta, 628 paquetes resueltos.
- TypeScript con `--noEmit`: correcto.
- ESLint: correcto, sin errores ni advertencias.
- Pruebas comerciales: 13 de 13 correctas.
- Catálogo: 253 slugs únicos, 251 referencias visibles y 2 inactivas.
- Imágenes y SEO de referencias activas: correctos.
- Compilación Vinext/Cloudflare: correcta.
- Páginas de producto: 251 respuestas 200 con canonical, Open Graph y JSON-LD.
- Productos inactivos: 2 respuestas 404.
- Rutas principales, sitemap y robots: 12 de 12 correctas.
- API de búsqueda, API de cotización y redirección heredada: correctas.

## Pendientes que requieren una fase independiente

No se activaron Supabase, inventario real, pagos, analítica, WhatsApp Cloud API, dominio, TLS ni publicación. La revisión visual en dispositivos físicos y la medición de Lighthouse/Core Web Vitals continúan siendo validaciones posteriores a realizar antes de producción.
