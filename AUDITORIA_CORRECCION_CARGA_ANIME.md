# Corrección de carga de Anime Shop

La optimización anterior reducía el trabajo por fotograma del hero y desactivaba precargas masivas de fichas. Sus pruebas no verificaban la descarga ni la pintura reales de las fotos en un navegador. Por eso no demostraban que la molestia descrita estuviera resuelta.

El Pulido Final había añadido AVIF como formato preferido del optimizador y calidad 85 en tarjetas. Ese camino puede exigir una conversión nueva para cada imagen/resolución en una primera visita. En una prueba local secuencial con ocho originales a 480 px y calidad 85, AVIF consumió 10.591 ms de procesamiento acumulado y WebP 457 ms. Estos son tiempos de codificación local: no son tiempos de espera medidos en Netlify, ni una medición de velocidad del usuario.

Antes de la corrección se observó en Chrome que, después de pasar a Cartoon, una de las cuatro primeras fotos seguía pendiente y usaba la URL del optimizador. Después de la corrección, las cuatro fotos iniciales consultadas en Cartoon, Rock, Urbanas, Todas y Anime estaban cargadas y usaban los archivos estáticos. Las capturas confirmaron posteriormente su pintura y etiquetas. No se calculó una mejora porcentual de velocidad.

## Implementación

Las tarjetas usan dos candidatos existentes: miniatura y original, con anchos verificados en los 1.250 registros del catálogo. El navegador elige según espacio y densidad; no se recodificaron ni redujeron los originales. Si falta metadata de una futura referencia, se usa su original. Las miniaturas del mismo ancho que el original no sustituyen al original.

Se anticipan cuatro fotos al acercarse explícitamente a una línea y las primeras cuatro tarjetas se cargan con eager. Las restantes conservan lazy. Las etiquetas se renderizan junto con cada tarjeta y conservan su fondo; se retira el backdrop blur por tarjeta. Se restauró la pintura normal eliminando los contain añadidos a las tarjetas en el parche anterior.

El nuevo parche consolida la optimización previa del controlador, pausa fuera de pantalla, tarjetas memoizadas, barra global y precargas, para poder aplicarlo aunque se omitiera el ZIP anterior. No modifica dependencias, inventario, precios, archivos de imagen/vídeo ni datos de contacto.

## Verificación

- Build de producción Next.js: TypeScript correcto y 1.410 páginas generadas.
- 1.258 comprobaciones de candidatos, dimensiones reales y marcado de fotos.
- 1.246 comprobaciones de producción: fichas, APIs, datos comerciales y previews; 38 cotizaciones generales.
- 8.728 comprobaciones de rutas, identidades e historial.
- 928 comprobaciones de catálogo y tarifas; cambio de línea desde un listado largo sin relleno heredado.
- 25 comprobaciones de render del hero y cinco secuencias.
- Controlador: 186 comprobaciones y verificación de 300 fotogramas del listado sin trabajo del hero; barra global con 120 fotogramas sin lecturas de layout. Estas últimas son pruebas con adaptadores, no medidas de FPS reales.
- Navegador Chrome con build de producción: Cartoon → Rock → Urbanas, filtros Canserbero, carga de 24 → 48 → 72 tarjetas, ficha Monarca Camel y regreso con 72 tarjetas y posición restaurada.
- Vista de 390 px dentro de iframe: Cartoon, Todas y Anime, dos columnas, primeras fotos y etiquetas presentes. Es una comprobación responsive, no una prueba física de teléfono ni de Safari.
- Consola consultada: solo errores del complemento del navegador de pruebas; no se observaron errores de la aplicación en esas operaciones.
- Hashes intactos del catálogo general/anime, política comercial anime, arte y secuencia del hero, controlador de cine respecto al ZIP anterior y restauración del historial.

## Límite de la comprobación

No se comprobó el nuevo código en el dominio de producción, porque se entrega para revisión y publicación manual. El cambio elimina un punto de espera concreto y reduce efectos repetidos; no garantiza idéntica fluidez en cualquier dispositivo o conexión. Para valorar el resultado real, comprobar el commit publicado en Netlify y una primera visita en el celular afectado. Oversize sirve como referencia de fluidez en el mismo equipo y red.
