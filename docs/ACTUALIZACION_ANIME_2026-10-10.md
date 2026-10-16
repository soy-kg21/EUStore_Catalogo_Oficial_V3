> Registro histórico de los primeros siete PDF. La revisión vigente incorpora URBANO 1 y contiene 1.211 diseños únicos; consulta ../LEEME_ACTUALIZACION_URBANO_1.md.

# Actualización Anime — 10 de octubre de 2026

El módulo `/anime` conserva su interfaz y su CSS. Se incorporaron 840 referencias nuevas con nombre y procedencia, y se consolidaron 19 duplicados de la fuente inicial. Se publican 1.028 diseños únicos y se preservan las 207 referencias históricas.

| Línea | Existentes | Nuevos | Total |
| --- | ---: | ---: | ---: |
| Anime | 125 | 538 | 663 |
| Cartoon | 18 | 135 | 153 |
| Rock | 28 | 143 | 171 |
| Urbanos | 17 | 24 | 41 |
| Total | 188 | 840 | 1.028 |

## Reglas conservadas

1 camiseta: $68.000 COP. 2 por $99.000 COP, promoción de campañas Meta Ads autorizadas; envío estándar incluido sujeto a cobertura. Disponibilidad, tallas y forma de pago se confirman antes del cierre. Las reglas y los datos del catálogo general 270g, zapatillas y conjuntos permanecen iguales.

Los nuevos diseños son `EU-ANIME-208` a `EU-ANIME-1047`. Se mezclan 19 nuevos y 6 existentes por cada bloque de 25 mientras ambas listas alcancen; después se muestran los restantes una sola vez. El orden es estable y se aplica después de filtrar.

## Archivos principales

- `data/anime-catalog.json`: inventario único, nombres reales del proveedor corregidos, líneas y franquicias.
- `data/anime-products.ts`: adaptador, productos visibles y compatibilidad histórica.
- `data/anime-index.json`: referencias válidas y alias para la selección.
- `data/anime-import-ledger.json`: las 1.017 ocurrencias revisadas de los siete PDF con decisión y referencia final.
- `data/anime-image-map.csv`: mapa actualizado de nombre/foto/línea/franquicia/procedencia.
- `lib/catalog-search.ts`, `/api/search` y `AnimeSearchCard.tsx`: búsqueda global compartida por la lupa y los resultados completos, con rutas y ofertas del inventario correcto.
- `lib/anime-commercial.ts`: oferta única del módulo.
- `public/anime/products`, `thumbnails`, `backdrops`: detalle fiel al proveedor, tarjetas WebP y fondos pequeños.
- `docs/meta-catalog-context.json`: conocimiento preparado para la futura configuración del agente nativo Meta.
- `docs/verification-anime.json` y `docs/qa/`: evidencia de pruebas y capturas.

## Errores corregidos

Selección que podía vaciarse al cargar; lectura de JSON inválido; falta de sincronización entre listado, detalle y pestañas; pérdida de tallas; búsquedas sensibles a tildes; filtros que ignoraban la URL; enlace accesible a un título inexistente; promociones duplicadas; búsqueda de cabecera sin el inventario Anime; nombres y categorías incoherentes; duplicados; respuestas HTTP incorrectas en alias y referencias inexistentes. Se añadieron metadatos de ficha y datos estructurados sin afirmar stock.

La revisión visual también distinguió Demon Slayer de la banda Slayer, Misty/Gengar de Ghost y Mikey Sano de Mickey Mouse. No se clasificaron únicamente por una coincidencia de palabras.

La lupa consulta ambas fuentes desde cualquier página; `/catalogo?q=Luffy` o `/catalogo?q=pokemon` también muestran camisetas del Anime Shop. Buscar “camiseta” muestra resultados de ambas colecciones. La página general sin consulta conserva su surtido y sus filtros previos. Material, colores no documentados y stock de Anime no se presentan como confirmados.

## Enlaces directos

- `/anime?linea=anime#coleccion`
- `/anime?linea=cartoon#coleccion`
- `/anime?linea=rock#coleccion`
- `/anime?linea=urbanos#coleccion`
- Ejemplo de franquicia: `/anime?linea=anime&categoria=dragon-ball#coleccion`

Los enlaces nuevos estarán disponibles en el dominio cuando se publique este proyecto.

## Imágenes

Los 3.084 recursos usados por los productos canónicos fueron decodificados y comprobados. No se aumenta resolución ni se cambia el estampado. Las fotos JPEG del PDF ya comprimidas se conservan cuando pesan menos que el WebP de detalle. Las tarjetas usan máximo 480×640, calidad 85; el fondo desenfocado 48×64, calidad 55. Tarjetas y fondos pesan un 51,94% menos que los archivos de detalle en conjunto; en los originales conservados la reducción es aproximadamente 67,85%. Estas cifras comparan archivos, no velocidad de red ni métricas de producción.

No se retiraron fondos con IA ni se inventaron imágenes. El material no documentado de las altas figura como “Por confirmar”; dos modelos se identifican explícitamente como poliéster. No se atribuye 180g universalmente a las altas.

## Ejecutar y comprobar

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test:anime
pnpm build
pnpm start
```

Con el servidor activo, en otra terminal:

```bash
CATALOG_TEST_URL=http://localhost:5173 pnpm test:anime
pnpm test:pricing
pnpm test:v2
```

Windows PowerShell puede usar `$env:CATALOG_TEST_URL='http://localhost:5173'; pnpm test:anime`. En el entorno de auditoría se usó `pnpm start --hostname 127.0.0.1`.

Resultados: build y TypeScript correctos; 59 bloques 76/24; categorías SSR, 19 redirecciones 308, búsqueda global en inicio, Anime y Combos, resultados completos, filtros y 404; 38 pruebas de precios y 30 de integración general; 25 pruebas de navegador en escritorio y móvil, sin errores JavaScript. Lint: cero errores, tres avisos de `<img>` en la cabecera compartida.

Para regenerar tarjetas/fondos:

```bash
python3 -m pip install Pillow
pnpm images:anime
```

El script conserva el detalle y no hace altas ni cambios de nombre. Si cambias datos, ejecuta las pruebas y reconstruye el proyecto. Para futuras altas, continúa después del código 1047, regenera el índice/CSV y actualiza la fuente de IA. No reutilices IDs o slugs históricos.

## Publicación y Fase 2

El ZIP entrega código e imágenes completos, sin `node_modules`, cachés ni archivos de entorno. Mantén las variables configuradas en el hosting al instalarlo. Esta entrega no ha publicado cambios en el dominio ni configurado Meta.

La Fase 2 usará el catálogo canónico y los enlaces por línea. La apertura prevista es preguntar qué modelos busca (Anime, Cartoon, Rock o Urbanos), aprovechando el contexto del anuncio cuando ya indica una línea. Se revisarán las instrucciones y fuentes actuales del agente cuando se reciba la configuración de WhatsApp.
