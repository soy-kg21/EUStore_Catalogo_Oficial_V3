# Evolución Urbana — Auditoría de recuperación y evolución premium

Fecha: 23 de septiembre de 2026. Base: EUStore_V3.zip proporcionado por el propietario.

## Dictamen

La base comercial se puede conservar. La evolución premium está parcialmente diseñada y parcialmente implementada. Los nombres de los ZIP y las etapas narradas en el TXT no demuestran integración ni pruebas completadas.

El siguiente trabajo debe empezar por consolidar un proyecto reproducible, continuar con la integración visual y terminar con pruebas de navegación, comercio, móvil y rendimiento. V4 Community queda después de estabilizar V3.

Esta entrega contiene auditoría, cuatro videos comprimidos, cuatro imágenes de respaldo y los dos archivos de recuperación de `build/` procedentes del nuevo `build.zip`. No es una nueva versión completa del sitio ni está publicada.

## 1. Fuentes y autoridad

| Fuente | Qué contiene y cómo usarla |
|---|---|
| EUStore_V3.zip | Base principal por indicación del propietario. 46.062 entradas, aproximadamente 1.211 MB descomprimidos; 1.177 MB corresponden a la caché `.sites-runtime`. Código y activos sin esa caché: aproximadamente 34 MB. |
| EUStore_V3_Premium_Foundation(1).zip | Ocho archivos adicionales respecto a la base: estructura, documentación y CSS. Ningún archivo compartido cambia. |
| EUStore_V3.2_Header_Premium(1).zip | Trece archivos adicionales respecto a la base, incluidos cuatro componentes. Ningún archivo compartido cambia. No sustituye ni integra el Header activo. |
| build.zip (recibido durante la auditoría) | Fuente más reciente para `build/`. Corrige el empaquetado concurrente de metadatos. Sustituye al paquete Build Actual anterior. |
| Evolucion_Urbana_Build_Actual(2).zip | Contiene `build/sites-vite-plugin.ts` y su licencia. Es código auxiliar, no una compilación final. |
| Evolucion_Urbana_Auditoria_Completa_V2_1(2).zip | Decisiones y auditorías anteriores, incluida documentación anidada de V2. Su visión sigue siendo útil, pero sus conclusiones no sustituyen la comprobación del código recibido. |
| Base_Maestra_Comercial_B1_Consolidada(1).xlsx | Nueve hojas. La hoja maestra contiene 253 productos de varias bodegas, pese al nombre B1. Se contrastaron IDs y precios con el JSON actual. |
| Perfecto, continuamos. Entramos aho(2).txt | Describe V3.6–V3.9 y V4. Al final reconoce que faltaba el proyecto real para construir la entrega completa. Es una hoja de ruta, no evidencia de implementación. |
| capturas EUStore.zip | Tres capturas de estructura y entorno local. Confirman `C:\Users\keine\EUStore` y un error de conexión en localhost:5173. No muestran la interfaz del catálogo funcionando. |
| videos para la nueva actualizacion…zip | Cuatro clips de unos diez segundos, con variantes horizontal y vertical. Procesados en esta entrega. |

## 2. Estado técnico y hallazgos prioritarios

### P0 — Recuperar una base ejecutable

`vite.config.ts` importa `./build/sites-vite-plugin`, pero el ZIP principal no contiene `build/`. El archivo sí está en los adjuntos Build Actual y build.zip. Se incluye una copia exacta del nuevo build.zip con licencia dentro de `recuperacion/build/`.

El nuevo build.zip añade una promesa compartida `packaging` y extrae `packageSitesMetadata`. Así, las llamadas concurrentes a `closeBundle` en una misma instancia del plugin comparten el empaquetado en lugar de borrar y copiar la misma carpeta simultáneamente. La licencia no cambia. Una prueba aislada con ocho llamadas concurrentes pasó y conservó la configuración y una migración de ejemplo. Esto no equivale a compilar toda la aplicación.

La captura del equipo muestra una carpeta `build`, de modo que no se puede concluir que el mismo archivo falte allí. Hay que comprobar su contenido antes de reemplazar nada. La ausencia sí está confirmada en el ZIP auditado.

`ERR_CONNECTION_REFUSED` significa que no se estableció la conexión con ese puerto. Puede deberse al servidor detenido, un fallo al arrancar o un puerto diferente. El contenido de la captura no determina la causa. El script local configura 5173 para el perfil portable.

Conservar React, TypeScript, interfaces App Router, Vinext/Vite y la lógica comercial. El comando de construcción actual corresponde a Vinext/Cloudflare; no es equivalente a haber probado Next.js nativo en otro hosting.

La caché `.sites-runtime` no debe formar parte del paquete de entrega. Su eliminación debe distinguir la caché del perfil de ejecución y las referencias de los scripts. El lector del perfil ya contempla su ausencia y selecciona `portable`. No borrar indiscriminadamente `build/`, `.openai/`, `scripts/` o configuraciones.

### P1 — Completar integraciones reales

| Área | Estado observado | Evolución necesaria |
|---|---|---|
| Header | Barra informativa, navegación, menú móvil y búsqueda existentes | Aprovechar el componente activo e integrar mejoras verificables. |
| Paquete Header Premium | Menú con enlaces `#`, carrito con solo título y búsqueda sin comportamiento | No instalarlo como reemplazo terminado. Rehacer conexiones, apertura/cierre y accesibilidad. |
| Hero | Imagen `/hero.webp`; marcador `data-video-slot` | Integrar video según pantalla, poster y alternativa sin reproducción. |
| Curaduría | Selección de cuatro productos | Introducir el video editorial sin desplazar el acceso al catálogo. |
| Categorías | Tres categorías derivadas del catálogo | Mantener enlaces y cantidades reales. No crear “Accesorios” sin productos. |
| Carrito | Página funcional con almacenamiento local y cotización en servidor | Reutilizar su lógica en el lateral; conservar página completa. |
| Búsqueda | Consulta por nombre, SKU y marca; color como filtro separado | Añadir color a búsqueda libre si se quiere que “negra” encuentre prendas por color. |
| Footer y confianza | Contacto, Instagram y privacidad | Completar contenidos verificados y estructura premium. |
| Políticas | Existe privacidad; faltan rutas específicas de términos, cambios y envíos | Recoger condiciones reales antes de presentar textos definitivos. |
| Animación | HomeMotion usa IntersectionObserver y respeta movimiento reducido | Extender esa base con moderación. Evitar capas de movimiento redundantes. |
| Modelo de datos | Modelo actual plano; Product V2 aparece en documentación | Añadir campos opcionales o adaptador compatible antes de una migración completa. |

### P1 — Datos y presentación comercial

- 253 productos: 248 activos, 3 en revisión y 2 inactivos. El repositorio publica 251 porque excluye únicamente los inactivos.
- Categorías: 128 zapatillas, 67 camisetas y 58 conjuntos, incluyendo los registros inactivos.
- Bodegas: B1 76, B2 50, B5 125 y dos sin asignar.
- Los 253 IDs de la hoja maestra coinciden con el catálogo y no se detectaron diferencias de precio individual.
- Los 253 registros tienen `stock: null`. No significa cero unidades ni disponibilidad confirmada.
- Pendientes de color: `zap_nac_b1_043`, `zap_nac_b1_061` y `zap_nac_b1_006`.
- Todas las rutas de imagen declaradas y sus variantes de 480 px existen. Los registros inactivos no declaran fotos; este control no equivale a revisar visualmente todo el inventario.
- Preservar reglas B1/B2/B5, separación de promociones por bodega y cotización obligatoria desde seis pares B2 o más de cuarenta prendas B5.
- Precios iguales entre fuentes no prueban vigencia comercial. Confirmar promociones y logística antes de lanzamiento.
- No usar etiquetas “más vendido”, “últimas unidades” u “originales” de forma global sin respaldo específico. El borrador AnnouncementBar sí incluye esta última afirmación, pendiente de validar.

### P2 — Experiencia, SEO y operación

La búsqueda del Header se presenta como modal, pero no implementa por sí misma encierro/restauración del foco. Conviene reutilizar el Dialog accesible existente. El contador del Header escucha el evento local del carrito, pero no el evento `storage` de otras pestañas; el carrito sí tiene ese soporte. Unificar ambos mediante las utilidades actuales.

El logo oficial existe en `public/imagenes/logo.png`, pero el encabezado utiliza una marca escrita en texto. Su integración debe respetar proporciones y legibilidad móvil.

Canonical, Open Graph, datos estructurados y sitemap ya tienen implementación. La indexación está bloqueada salvo `INDEXING_ENABLED=true`. Mantener el bloqueo durante revisión y comprobarlo explícitamente al publicar. No se verificaron dominio, DNS ni el sitio público.

Supabase tiene adaptador y archivos de preparación. La auditoría no acredita una conexión externa activa, inventario operativo, panel de administración, pasarela de pago, bot de WhatsApp ni analítica funcionando. El flujo actual termina en consulta por WhatsApp, no en cobro dentro de la web.

## 3. Videos preparados

Formato de salida: MP4, H.264, yuv420p, faststart, sin audio. Se preservan duración y proporción; móvil se reduce a 720 × 1280 y curaduría de escritorio a 1280 × 720. Hero de escritorio conserva 1080 × 608. Compresión con pérdida, CRF 25. Los originales permanecen intactos.

| Video | Original, MB | Web, MB | Reducción |
|---|---:|---:|---:|
| hero-desktop.mp4 | 6,43 | 1,61 | 75,0 % |
| hero-mobile.mp4 | 7,43 | 1,43 | 80,8 % |
| curaduria-pc.mp4 | 11,72 | 2,76 | 76,4 % |
| curaduria-mobile.mp4 | 8,59 | 2,24 | 73,9 % |
| Total | 34,17 | 8,04 | 76,5 % |

MB decimales. Los cuatro posters WebP suman aproximadamente 0,31 MB, fuera del total de videos.

Rutas previstas en el proyecto:

- `public/media/hero/hero-desktop.mp4` y `hero-desktop.webp`.
- `public/media/hero/hero-mobile.mp4` y `hero-mobile.webp`.
- `public/media/curaduria/curaduria-pc.mp4` y `curaduria-pc.webp`.
- `public/media/curaduria/curaduria-mobile.mp4` y `curaduria-mobile.webp`.

Las URL del navegador comienzan en `/media/`, sin `public`. Copiar archivos todavía no hace que aparezcan en la página: falta integrar los componentes.

Integración propuesta: descargar una sola variante por pantalla, usar poster inmediato, `muted` y `playsInline`; tolerar bloqueo de autoplay. Cargar curaduría al aproximarse al viewport y pausar fuera de pantalla. Para movimiento reducido o ahorro de datos, mostrar poster y reproducción voluntaria. Incluir control accesible de pausa. No descargar ambos videos para ocultar uno solamente con CSS.

Los posters se revisaron visualmente y los MP4 se decodificaron completos sin errores. Los clips del hero conservan una marca visible que ya venía en el material original. Validar encuadre y posición del texto al montar la interfaz. Falta reproducción real en Safari/iOS y Chrome/Android.

## 4. Orden de evolución y criterios de cierre

| Etapa | Trabajo | Criterio de cierre |
|---|---|---|
| 1. Consolidación | EUStore_V3 como raíz, recuperar build cuando falte, dependencias del lockfile, documentar arranque | Instala, arranca, valida tipos y compila en el entorno elegido. |
| 2. Identidad y navegación | Logo, Header, menú, búsqueda y carrito lateral conectado | Enlaces reales, teclado y móvil, contador y selección consistentes. |
| 3. Portada multimedia | Hero responsive, curaduría, categorías y posters | Una variante descargada por sección, reproducción controlada y CTA legible. |
| 4. Producto y conversión | Galería, tallas, relacionados y mensajes WhatsApp | Precio y talla correctos, selección persistente, cotización sin regresiones. |
| 5. Confianza | Footer y páginas informativas con condiciones reales | Enlaces completos y textos contrastados con el negocio. |
| 6. Validación final | Tipos, build, rutas, comercio, consola, móvil y medición | Evidencia nueva, incidencias corregidas y versión candidata restaurable. |
| 7. Community | Lookbook y contenido editorial, después de V3 | Contenido disponible y estable sin perjudicar descubrimiento de productos. |

Revisar anchos de 320, 375, 390, 430, 768 y 1440 px. Probar búsqueda, filtros, paginación, producto, falta de talla, agregar/eliminar/cambiar cantidades, recarga, estado vacío, error de cotización y límites mayoristas. Verificar redirecciones antiguas y 404 de productos inactivos. Medir rendimiento después de integrar el video; no asignar puntuaciones estimadas.

## 5. Verificaciones realizadas y límites

Realizadas ahora: inventario de ZIP, comparación de archivos entre tres versiones, inspección del código activo, capturas y documentos de continuidad; contraste de los 253 IDs y precios de la hoja maestra; control de rutas de imágenes y miniaturas; ejecución satisfactoria del script de 13 casos comerciales y validaciones de catálogo; compresión, inspección técnica y decodificación completa de cuatro videos; apertura visual de los cuatro posters; comparación del nuevo build.zip y prueba aislada de ocho llamadas concurrentes al empaquetado.

No ejecutadas ahora: instalación completa de dependencias, TypeScript, compilación de la aplicación, pruebas HTTP de rutas, navegación interactiva, medición de rendimiento ni despliegue. Los resultados de `docs/VERIFICACION.md` fechados el 22 de septiembre son antecedentes, no resultados nuevos. El contraste del Excel se limita a la hoja maestra y al inventario de hojas, no a recalcular o certificar todas sus reglas y fórmulas.

## 6. Recuperación en el equipo

La raíz vista en capturas es `C:\Users\keine\EUStore`. La carpeta interior `EUStore_V3` del ZIP debe mapearse a esa raíz, evitando crear otra raíz anidada por accidente.

1. Conservar una copia de la carpeta local antes de consolidar.
2. Comprobar si existen `build/sites-vite-plugin.ts` y su licencia. El paquete adjunto contiene la versión actualizada; comparar con la copia local y, tras el respaldo, recuperar los archivos adjuntos de `recuperacion/build/` en la carpeta `build/` de la raíz.
3. En PowerShell, abrir esa raíz y ejecutar `node --version`, `pnpm --version` y `pnpm dev` si las dependencias ya están instaladas. El proyecto declara Node >=22.13 y pnpm 11.25.0. Para instalación limpia, usar `pnpm install --frozen-lockfile` con la versión declarada.
4. Abrir la dirección que informe la terminal y conservarla ejecutándose. Si falla, el mensaje de la terminal es la evidencia para el diagnóstico siguiente.

La primera entrega de desarrollo debe ser una versión consolidada con changelog, instrucciones y pruebas nuevas. No superponer los paquetes antiguos completos como si fueran actualizaciones terminadas.
