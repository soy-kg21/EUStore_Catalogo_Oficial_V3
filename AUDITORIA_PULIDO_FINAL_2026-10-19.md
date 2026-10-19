# Auditoría del pulido final — EUStore

Base: versión premium aprobada, comparada por SHA-256 con el estado guardado
antes de este pulido. El ZIP contiene solo cambios respecto a esa base.

## Verificación realizada

- Compilación de producción con Next.js 16.3.4: correcta, TypeScript correcto,
  1.410 páginas estáticas generadas.
- Integración del catálogo: 928 comprobaciones de precios 1–49+, API, WhatsApp,
  exportaciones de información, combos reales y separación de bodegas; correcta.
- Navegación anime: 8.728 comprobaciones de identidad, rutas, historial,
  restauración y filtros; correctas.
- Geometría cinematográfica: 81 comprobaciones en anchos de 308 a 3.840 px.
- Controlador de scroll: 186 comprobaciones con adaptadores de DOM y reloj.
- Hero real renderizado en servidor: 25 comprobaciones de las cinco secuencias.
- Reproductor real con entorno simulado: 23 comprobaciones de selección móvil/
  escritorio, ahorro de datos, 3G, movimiento reducido, control manual,
  pausa al ocultar la página y limpieza del recurso.
- Renderizado de Esencia y extensiones: imágenes y destinos WhatsApp presentes,
  mensaje de cada línea correcto; extensiones sin fichas ni precios inventados.
- Rutas estáticas de recursos modificados: 19 comprobadas, sin recursos ausentes.
- Los cuatro MP4 conservan el mismo SHA-256 del flujo de video que los originales
  enviados. Se quitó el audio y se colocó el índice antes de los datos de video.

Las comprobaciones de geometría, servidor y DOM simulado NO sustituyen una
revisión visual en un navegador. No hubo navegador disponible para esta tarea.
No se midieron Core Web Vitals ni carga en Netlify o en dispositivos reales.

## Conservación

Los hashes de data/catalog.json, data/anime-catalog.json,
lib/anime-commercial.ts, lib/pricing.ts, lib/anime-routes.ts,
components/anime/useAnimeListNavigation.ts y
components/anime/AnimeHistoryBridge.tsx siguen idénticos a la versión aprobada.
Se conservan las 253 referencias generales y las 1.209 referencias canónicas
de Anime Shop, junto con sus alias. No se modificaron dependencias ni hosting.

## Medios

La imagen de los videos se copió sin recodificación: conserva exactamente el
detalle y resolución de los originales. Se descartaron las variantes de prueba
que aumentaban artificialmente resolución y peso. Solo se incluye la versión
MP4 de cada orientación; el cliente no descarga ambas orientaciones a la vez.
La carga por proximidad y los controles de ahorro/reproducción siguen activos.
La configuración de imágenes permite calidad 85 para fotos y 90 para nuevos
heroes; AVIF tiene preferencia y WebP actúa como alternativa según el navegador.
La primera conversión de una imagen puede costar más cómputo que una respuesta
ya almacenada en caché. Los fondos cinematográficos de Anime Shop usan sus
fuentes existentes; reducir el grano superpuesto mejora su claridad percibida,
sin añadir detalle nuevo ni modificar la secuencia o las distancias de scroll.

### Nuevos fondos

Creación con la herramienta integrada de generación de imágenes, a partir de
las referencias recibidas. Conversión WebP de los resultados para uso en web.
Son editoriales de colección y no fichas de venta con disponibilidad o precio.

- public/media/collections/importadas-editorial.webp: 1536 × 1024, 237.944 bytes.
- public/media/collections/conjuntos-editorial.webp: 1536 × 1024, 188.208 bytes.

Prompts utilizados (inglés):

**Zapatillas**
Use case: compositing. Create a photorealistic premium ecommerce editorial
background for Evolución Urbana, Colombian streetwear store, wide landscape
1536x1024. Input image is the exact sneaker product reference. Keep the pair of
light grey and white sneakers recognizable with the same materials, silhouette,
laces, grey N details, cream sculpted soles and proportions. Replace the chair,
wood wall and shoebox with a dark charcoal architectural concrete pedestal in an
urban nighttime environment, subtle moss green and acid lime rim light,
photographic luxury campaign lighting, tactile realistic mesh and suede. Product
sits on the right half, fully visible with natural grounded shadows. Leave the
left 45 percent dark and uncluttered for separate HTML copy, and enough breathing
room for responsive crops. No people, no text, no extra branding, no watermark.
This is a category editorial, preserve the sneaker design.

**Conjuntos**
Use case: compositing. Create a photorealistic premium ecommerce editorial
background for Evolución Urbana, Colombian streetwear store, wide landscape
1536x1024. The input is the exact tracksuit product reference: black zip hoodie
with white hood, white shoulder and sleeve bands, matching black long joggers
with white side stripe, small gold swoosh marks and small rectangular fabric
labels. Preserve garment details, colors, cuts and recognizable appearance.
Replace sofa with a charcoal architectural fashion studio with concrete surfaces
and subtle deep green / acid lime edge lighting. Arrange the hoodie on a hanger
and the matching joggers folded on a low concrete plinth, garment subjects on the
right half, professional realistic fabric and soft cinematic shadows, premium
streetwear campaign. Keep the left 45 percent quiet and dark for separate HTML
text, provide breathing room for responsive crops. No person, no text, no added
logos, no watermark.

## Revisión pendiente del propietario

Comprobar en navegador y celular la composición visual, video, anuncios,
combos desplegables, Esencia, mensajes WhatsApp y regreso desde producto de
Anime Shop. Revisar después en un computador/TV amplio si se dispone de él.
Este trabajo prepara el parche local; no realiza publicación en Netlify.
