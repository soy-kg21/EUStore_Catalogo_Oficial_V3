# Evolución Urbana · Anime Universe V5 · Parche 5.1

Copia independiente del proyecto completo. Anime Shop forma parte del mismo catálogo general.

Abre **esta carpeta V5** en VS Code y usa PowerShell:

```powershell
node --version
pnpm.cmd --version
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Requiere Node >=22.13 (comprobado con Node 24) y pnpm 11.25.0.

- Inicio general: http://localhost:5178/
- Catálogo general: http://localhost:5178/catalogo
- Anime Shop: http://localhost:5178/anime
- Todas las líneas: http://localhost:5178/shop
- Otras líneas: `/cartoon`, `/rock`, `/urbanas`.

Lee **LEEME_ANIME_UNIVERSE_V5.txt** para la instalación y el recorrido de prueba.

## Parche 5.1

La composición usa las mismas imágenes de Gojo, iluminación verde/azul/violeta y transiciones del prototipo aprobado. Es una escena por capas con movimiento de cámara, composición y efectos; no contiene un nuevo modelo articulado de Gojo ni una película generada en Blender.

GSAP y ScrollTrigger coordinan una única secuencia vinculada directamente a la posición de la página. No hay temporizador, tramos en cola ni duración obligatoria: al dejar de desplazar la página, la escena se detiene. Al subir, retrocede. Se redujo la distancia de scroll a entre 2.400 y 4.000 px, según la pantalla.

El desplazamiento nativo de rueda, táctil, teclado y barra lateral está libre, incluido el paso de categorías a productos. «Inicio» dentro de la experiencia vuelve al principio de Anime Shop mediante un desplazamiento suave, recorriendo la escena en reversa. «Explorar la colección» realiza un desplazamiento suave a las categorías. Los enlaces solicitados por el cliente son las únicas navegaciones automáticas.

La barra verde mantiene su diseño y asigna un 16 % del recorrido a la introducción de Anime Shop; en las demás páginas conserva el cálculo normal. La reducción de movimiento mantiene su presentación directa.

La distribución móvil reserva la altura real del título, los botones y las tres camisetas. En pantallas cortas se permite leer el bloque inicial antes del tramo fijado. Categorías y productos siguen en flujo normal al terminar, sin un bloque vacío entre ambos.

Los fondos de categorías son cinematográficos. Anime conserva a Gojo y Urbanas usa la escena nocturna de moda callejera. Los conteos son diseños canónicos, no existencias físicas: 644 Anime, 163 Cartoon, 170 Rock, 232 Urbanas; 1.209 en total.

La colección tiene un selector compacto de líneas y sus propios filtros, disponibles entre los productos sin regresar a la escena. Los filtros, las franquicias y las categorías actualizan los productos sin desmontar la escena. Se eliminó el enlace «Catálogo general» del bloque cinematográfico; el menú general original sigue disponible. Las reglas de precios, selección, tallas, enlaces propios, metadatos sociales y orden de cinco dobles más una referencia restante se mantienen.

Las tarjetas muestran la franquicia o colección, la referencia a la derecha y un botón compacto «VER DISEÑO». El bloque de combos tiene una presentación coordinada, con los mismos precios y condiciones.

El encabezado, logotipo, anuncio móvil, botón sol/luna y pie son los componentes originales del catálogo general. Las tipografías de esta experiencia se sirven localmente; sus licencias están en `public/fonts/cinema`.

## Verificación

```powershell
pnpm.cmd exec tsc --noEmit
pnpm.cmd test:anime-cinema
pnpm.cmd test:anime-cinema-runtime
pnpm.cmd test:anime-journey
pnpm.cmd test:anime-integration
pnpm.cmd test:anime-hero
pnpm.cmd test:universe
pnpm.cmd test:anime
pnpm.cmd test:anime-shop
pnpm.cmd test:anime-merchandising
pnpm.cmd test:anime-premium
pnpm.cmd build:vercel
pnpm.cmd test:anime-build
```

Las pruebas de geometría y desplazamiento ejecutan el controlador con adaptadores de DOM y reloj. No sustituyen una inspección visual en Chrome/Safari o en un teléfono real. El entorno de esta entrega no proporciona un navegador de prueba; esa revisión visual queda pendiente al abrirlo localmente. El informe de comprobaciones está en `docs/VERIFICACION_ANIME_UNIVERSE_V5_1.json`.

La entrega no publica en Vercel, no cambia campañas y no conecta ni actualiza una base de datos o el agente de WhatsApp. Los archivos V1–V4 y las herramientas antiguas se conservan como historial, sin intervenir en el hero V5.


## Conector BackOffice V5.2

Publicación propia desde Productos. Consulta docs/CONECTOR_BACKOFFICE.md antes de activar EUSTORE_LIVE_CATALOG. El conector usa snapshots completos en Netlify Blobs, cambios condicionados por ETag y fotos con verificación SHA-256. No envía costos, proveedores ni credenciales al catálogo público. Validación de protocolo: pnpm test:live-sync.
