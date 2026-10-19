# Auditoría: optimización de Anime Shop

Comparación con la versión premium y pulido final anterior al parche.

## Qué se verificó

- Compilación de producción y TypeScript: correctos; 1.410 páginas generadas.
- 928 comprobaciones comerciales: precios 1–49+, WhatsApp, API, combos reales,
  separación de bodegas y extensiones, más el cambio de línea desde scroll profundo.
- 8.728 comprobaciones de identidad, rutas, historial y restauración instantánea.
- 81 comprobaciones de geometría entre 308 y 3.840 píxeles.
- 186 comprobaciones anteriores del controlador real de scroll, más pruebas
  de trabajo fuera de vista, regreso al hero, resize del canvas y pestaña oculta.
- Hero real renderizado en servidor: 25 comprobaciones de las cinco secuencias.
- Salida de producción: 1.246 comprobaciones de HTML, fichas, APIs, metadatos,
  cotizaciones y generación de imágenes sociales.
- Barra de progreso real en 120 frames: cálculo correcto, cero lecturas DOM ni
  escrituras globales durante esos frames; actualización de longitud al cargar
  más, adaptación a la cabecera, visibilidad y limpieza comprobadas.

## JavaScript de la ruta

Se sumaron los tamaños de los archivos JS locales mencionados por el manifiesto
cliente de `/anime`, antes y después de compilar. La compresión es gzip local,
con las mismas opciones para ambas versiones.

| Medida | Antes | Después |
|---|---:|---:|
| Fragmentos JS medidos, bytes sin comprimir | 473779 | 360948 |
| Los mismos fragmentos comprimidos con gzip, bytes | 144608 | 100616 |

Reducción de aproximadamente 30,4 % en el tamaño gzip de los fragmentos medidos.
Esta suma no es el total de imágenes, fuentes, datos RSC, runtime del navegador
ni recursos de toda la tienda. Tampoco mide el tiempo de descarga en Netlify.

## Trabajo del controlador antes y después

Se ejecutó el controlador real con adaptadores deterministas de DOM y reloj en
anchos de 390 y 1.440 píxeles. Se compararon 240 pasos en el hero y, por separado,
300 pasos adicionales en una zona de productos, después de salir del hero.
Las dos anchuras dieron los mismos contadores en este escenario.

| Operación del controlador | Hero antes | Hero después | Listado antes | Listado después |
|---|---:|---:|---:|---:|
| Lecturas de dimensiones | 1680 | 0 | 2100 | 0 |
| Consultas DOM | 2880 | 0 | 3600 | 0 |
| Dibujos del canvas | 240 | 239 | 300 | 0 |
| Recreaciones de dimensiones del buffer | 104 | 8 | 0 | 0 |
| Asignaciones de estilos | 9840 | 5846 | 12300 | 0 |

El primer fotograma idéntico se reutiliza, por eso el hero después dibuja 239
veces en 240 pasos. Las mediciones iniciales y los recálculos por resize siguen
existiendo y se realizan fuera de esos bucles. Durante un resize real, cambios
por fuentes o contenido, sí habrá nuevas lecturas de dimensiones.

Estas pruebas verifican eliminación de trabajo y preservación de comportamiento;
no reproducen el motor de layout, pintura ni GPU de un navegador. No se midieron
FPS, Core Web Vitals ni rendimiento en el celular del propietario.

## Conservación y alcance

Se comprobaron por SHA-256, sin cambios, `lib/anime-cinema.ts` (incluye la
geometría y las distancias), `lib/anime-cinema-art.ts`, las reglas de precios,
los dos catálogos, `useAnimeListNavigation.ts` y `AnimeHistoryBridge.tsx`.
No se cambiaron imágenes, videos, fuentes, rutas de productos ni dependencias.
Se conservan las 1.209 referencias canónicas y sus alias.

La barra global de progreso también se optimiza, pues es compartida por las
páginas. Los cambios de precarga del menú se aplican cuando la ruta pertenece
a Anime Shop. En otras rutas se conserva el comportamiento anterior del menú.

## Pruebas reproducibles

En la raíz del proyecto, después de aplicar el parche:

```text
node scripts/check-anime-cinema-runtime.mjs
node scripts/check-scroll-progress.mjs
node scripts/check-anime-catalog-navigation.mjs
node scripts/check-catalog-upgrade.mjs
pnpm build
node scripts/check-anime-build.mjs
```

La revisión visual e interactiva en dispositivos reales sigue pendiente.
