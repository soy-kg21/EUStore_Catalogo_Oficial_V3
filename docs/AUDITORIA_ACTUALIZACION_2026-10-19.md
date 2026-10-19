# Auditoría de la actualización — 19 de octubre de 2026

El parche aplica los ocho ajustes solicitados sobre `EUStore_Catalogo_Copia_V3_GitHub.zip`. Se revisaron las cinco imágenes y los dos videos adjuntos. La entrega contiene diferencias respecto del ZIP original y archivos nuevos; no incluye dependencias ni compilaciones.

## Integridad comprobada

Se compararon los archivos finales con los bytes del ZIP original:

- `data/catalog.json`: conserva sus 253 registros, con sus estados originales.
- `data/anime-catalog.json`: conserva los 1.250 registros y alias; siguen visibles 1.209 referencias canónicas.
- Índices, alias y rutas públicas de anime: conservados.
- `lib/pricing.ts` y `lib/commercial.ts`: conservados.
- Reglas comerciales generales: iguales; únicamente B7 se alinea con la nueva tarifa de Anime Shop.
- `package.json`, `pnpm-lock.yaml`, `next.config.ts` y estilos globales principales: idénticos al original.
- No se activaron las referencias importadas que estaban inactivas ni se agregaron productos a las nuevas extensiones.

## Cambios funcionales

1. **Anuncios del inicio.** Una frase visible por turno, permanencia de 4.000 ms y desplazamiento de 340 ms. Pausa manual, selección de frase, pausa al pasar el cursor, pestaña oculta y respeto de reducción de movimiento.
2. **Sección 04.** Composición editorial Street Files; imagen ampliada, numeración, indicador de turno, vistas de productos reales y selector de looks. Rotación cada siete segundos, con pausa al interactuar o abrir los detalles. Se conservan los enlaces y la consulta por WhatsApp.
3. **Puertas de camisetas.** Fondo urbano de los recursos existentes y el Gojo de `/anime/universe/anime.webp`, que corresponde a la captura. Se eliminan la línea decorativa inferior y el borde interior duplicado. Las capas de contraste conservan la lectura.
4. **Cambio de línea en anime.** Se elimina el mecanismo de relleno y altura mínima que conservaba la posición de una lista anterior. Si el cliente está entre productos o al final, la nueva línea se posiciona de inmediato en su primera fila, debajo del selector.
5. **Regreso al listado.** El historial solicita la recuperación de la selección anterior. Primero se recupera la paginación; después se coloca el listado con desplazamiento instantáneo antes de pintar. La geometría de la escena se mide en el efecto de layout y se actualiza en la misma colocación. Se desactiva la animación de entrada de página para listados de anime. Se conserva el anclaje a la tarjeta y su adaptación al cambio de ancho.
6. **Precios.** Fuente comercial actualizada y coherente en tarjetas, hero, fichas, vista rápida, cajón del combo, mensajes de WhatsApp, API, escala B7 y fuentes IA. La exportación posterior mantiene las tres escalas mayoristas.
7. **Combos+.** Cuatro bloques: Anime Shop, zapatillas participantes B1, oversize B5 y conjuntos B5. Cada bloque presenta dos referencias reales del mismo inventario comercial. Los totales generales se obtienen del cotizador existente; el ahorro se compara con dos compras individuales. Las tablas conservan sus escalas y se agrega Anime Shop.
8. **Extensiones.** Puertas en zapatillas y conjuntos. Nuevas rutas `/zapatillas-importadas` y `/conjuntos-buzos`, con estado de colección en preparación, regreso al catálogo actual y contacto. Integración en sitemap y categoría activa del menú.

## Tarifas comprobadas

| Cantidad | Total | Por camiseta |
| --- | ---: | ---: |
| 1 | $68.000 | $68.000 |
| 2 | $93.000 | $46.500 |
| 3 | $126.000 | $42.000 |
| 4 | $152.000 | $38.000 |
| 5 | $180.000 | $36.000 |
| 6–11 | Cantidad × $32.000 | $32.000 |
| 12–23 | Cantidad × $29.000 | $29.000 |
| 24–48 | Cantidad × $26.000 | $26.000 |

Desde 6 se requiere pago anticipado, sin contraentrega y transporte por cotizar. Desde 49 se conserva una cotización humana porque no se proporcionó una tarifa para ese rango. Se respetan los descensos de total al cruzar escalas mayoristas, según los precios solicitados.

## Pruebas realizadas

- Compilación de producción con Next.js y comprobación TypeScript.
- Cotización de cada cantidad de 1 a 48, importes unitarios exactos, rechazo de cantidades inválidas y derivación a asesor desde 49.
- Mensajes de WhatsApp con cantidades, tallas, enlaces y totales actualizados.
- 38 casos comerciales contra el controlador compilado del catálogo general.
- APIs de selección, búsqueda y consulta de referencias; validación de entradas y exclusión de datos internos.
- HTML, SEO, canonicals, menú y vista social de las 1.209 fichas de anime; generación de dos imágenes sociales de 1.200 × 630.
- Integridad de alias, rutas históricas, imágenes y especificaciones.
- Paginación y colocación instantánea del regreso, incluyendo repetición de efectos de React y aislamiento por filtros.
- Clic real del componente de Rock a Cartoon desde una posición simulada de 10.000 px: primera fila colocada debajo del selector, sin relleno ni altura mínima heredados.
- Renderizado de los cuatro bloques de combos; enlaces e imágenes de referencias reales; una sola bodega por bloque general y totales coincidentes con el cotizador.
- Hero, recomendaciones, merchandising y controlador de la escena cinematográfica.
- Geometría de la escena en anchos de 308, 320, 390, 700, 768, 1.024, 1.440, 1.920, 2.560 y 3.840 px.

Se ajustaron pruebas antiguas a los nuevos precios, a la importación del controlador de la escena y a la restauración antes de pintar. Se corrigió una ruta temporal de una prueba que suponía una carpeta de auditoría existente y se normalizaron los finales de línea Windows al verificar huellas de texto. La referencia de integridad del inicio y B7 se actualizó para los cambios autorizados; el resto se mantiene.

## Límite de verificación

No hubo navegador de pruebas disponible para este entorno. Las pruebas de interacción utilizan adaptadores de DOM y los resultados de producción se inspeccionan directamente; esto no equivale a una revisión visual en Chrome, Safari, un celular, una tablet o un televisor. Antes de publicar conviene comprobar el aspecto, los controles táctiles y el historial en el celular real del propietario. No se realizó un despliegue ni se cambió la configuración de Netlify.
