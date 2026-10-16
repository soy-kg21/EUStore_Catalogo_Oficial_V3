# Evolución Urbana · 25 septiembre 2026

Copia completa del proyecto premium anterior. React, TypeScript, Next, Vinext y los componentes existentes se conservan. Sin publicación ni cambios en la cuenta Vercel del propietario.

## Interfaz

- Verde lima #CCFF00 y variación #D8FF38.
- Logo original, nombre Evolución Urbana sin STORE en la cabecera, anuncio sin globo inicial.
- Menú móvil corregido: contenido por encima del desenfoque, scroll propio y seis productos sugeridos con desplazamiento horizontal.
- Buscador: espera reducida de 220 a 120 ms y caché en memoria durante la sesión; incluye categorías y colores en la búsqueda. No es una medición de rendimiento en dispositivos reales.
- Nueve imágenes WebP originales recibidas, orden 1/2/3 por categoría. Ciclo suave de 15 segundos y soporte de movimiento reducido. Primera imagen permanece como fondo para evitar cuadros vacíos. Los archivos originales suman aproximadamente 577 KB; se conserva su calidad.
- Título de categorías sin salto manual; precios desde, descuentos de referencias y condiciones de hasta cinco unidades.
- Control de video: entrada con texto, después icono compacto; el texto reaparece con hover/foco. Pausa y reproducción conservan el manejo de ahorro de datos y visibilidad.
- Transición breve entre páginas. Filtros con desplazamiento independiente en escritorio; tablet y móvil en una columna.
- Tarjetas y fichas con precio regular, precio final, descuento calculado y beneficios. Carrito con mensajes para cotización mayorista y despachos separados.
- Instagram, Facebook, TikTok y WhatsApp con los destinos indicados por el propietario.

## Reglas comerciales

Fuente activa: `data/pricing-policy.json`, aplicada por `lib/commercial.ts` y `lib/pricing.ts`. El catálogo local y las respuestas de Supabase pasan por estas reglas para evitar precios anteriores en la web. No se modificó una base de datos externa ni la IA de WhatsApp.

- B1-B/C/D/E: 112900 / 105900 / 97700 / 88200 / 88200 por unidad de 1 a 5 unidades B1.
- B1-F: 116900 individual; 113900 al sumar otra unidad al pedido. B1-G: 124700 / 118400. Se interpreta «integrar con otros productos» como dos o más unidades; puede ser otra bodega según la instrucción original.
- B1-A mantiene su precio individual anterior: no se recibió cambio para este grupo. No se le aplica una escala inventada. Sí cuenta para el volumen B1 y la derivación mayorista.
- B2-A/B: 112900 individual; no se inventó una escala adicional de 2–5 unidades.
- B2-C: 116900 / 114700 al combinar; B2-D: 117700 / 113000 al combinar.
- Corrección recibida: B2-129900 → B2-E, precio regular159900, individual119900, combinado116700. B2-135900 → B2-F, regular159900, individual124700, combinado119900. Para E/F, la combinación cuenta unidades de B2, conforme a la corrección del propietario.
- B5 camisetas: 97440 / 88480 / 78400 / 68320 / 68320. Conjuntos: 114718 / 104925 / 97930 / 88137 / 88137.
- Confirmación del propietario: sumar camisetas y conjuntos para determinar el escalón B5. Ejemplo 1+1: 88480+104925=193405. Cada prenda mantiene su propia tarifa.
- B1/B2 y futuras B3/B4: desde 6 unidades por bodega no se calcula ni muestra tarifa mayorista. Asesoría WhatsApp.
- B5: mayoristas 6–11, 12–23 y 24–36 según las tarifas recibidas. Se muestra subtotal de productos; envío y total final pendientes de asesoría. Más de36: cotización completa.
- B6/B7: tarifas futuras registradas, sin crear productos ficticios. Más de23 unidades: cotización, porque no se recibió otro rango.
- Pago anticipado desde6 unidades por bodega. Envío mayorista cotizado, nunca se muestra como gratuito. Hasta5: envío incluido y contra entrega.
- B3 futura: desde4 hasta5 pares recargo16000–20000 pendiente de asesor. No se inventó una cifra exacta.
- Mezclar bodegas conserva los beneficios y separa los despachos. La cantidad total del carrito no activa mayorista si ninguna bodega alcanza6.

Los porcentajes se calculan desde precio regular y final y se redondean al entero: B1 x2 resulta24%, no25%; camiseta B5 x3 resulta30%, no13%. Se priorizan los importes expresos del propietario. Los importes COP conservan sus valores exactos, sin redondearlos a centenas.

Los archivos `data/commercial-rules.json`, la semilla SQL y los importadores previos se conservan como material anterior. NO son el motor activo de promociones de esta web y no deben usarse para actualizar WhatsApp con tarifas actuales. La siguiente fase del ecosistema debe partir de `data/pricing-policy.json`.

## Reseñas

No se recibieron testimonios reales. La sección utiliza contenido veraz de asesoría y beneficios mientras se completan. `CustomerReviews` está preparado para `data/reviews.json`, con campos `name`, `text`, `rating` (1–5) y `date`. Añadir únicamente reseñas reales autorizadas. No se publican nombres, estrellas ni afirmaciones de verificación inventadas.

## Comprobaciones

- TypeScript y compilación de producción Next.js completados.
- 38 casos de integración de precios aprobados: escalones, límites, mezclas, mayoristas, corrección E/F y rechazo de cantidades inválidas.
- Navegador: revisión de escritorio y marcos de390/768px, menú móvil visible, búsqueda Vaporfly, selección de talla38, apertura de carrito y aviso desde6 pares.
- Nueve imágenes de categorías cargadas; escritorio sin desbordamiento horizontal.
- No probado aún: despliegue en la cuenta Vercel del propietario, red móvil real, dispositivos físicos ni conexión real a Supabase.

## Ejecución y Vercel

Los comandos anteriores `dev`/`build` mantienen el entorno Vinext. `dev:next`, `build:vercel` y `start:next` utilizan la dependencia Next ya presente y un directorio `.next-native` para separar artefactos. `vercel.json` especifica Next.js y el comando de build. No se requiere GitHub.

Configuración consultada: https://vercel.com/docs/project-configuration/vercel-json

Se incluye una captura de categorías en esta carpeta. No garantiza ausencia de errores en todos los navegadores; refleja la revisión realizada.
