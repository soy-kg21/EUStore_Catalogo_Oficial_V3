# Evolución Urbana: publicación e indexación gratuita

## El bloqueo encontrado

El 29 de septiembre de 2026 se comprobó que la web pública devolvía:

- `robots.txt`: `Disallow: /`.
- Portada: `<meta name="robots" content="noindex, nofollow">`.

La configuración anterior exigía `INDEXING_ENABLED=true` para permitir el rastreo
y la indexación. Si faltaba esa variable, el sitio quedaba bloqueado.

## Lo que incluye esta versión

- Indexación habilitada por defecto en producción. Un valor explícito
  `INDEXING_ENABLED=false` sigue bloqueándola: cámbialo si ya existe en Vercel.
- Las versiones Preview y Development de Vercel siguen bloqueadas, incluso
  si tienen la variable en true.
- Nombre del sitio: Evolución Urbana. Nombre alternativo: Evolución Urbana Store.
- Datos estructurados WebSite y Organization en la portada, con logo y los
  perfiles de Instagram, Facebook y TikTok ya presentes en la tienda.
- Título de portada: Evolución Urbana | Tienda de moda urbana en Colombia.
- Descripción de la tienda y nombre/idioma para vistas previas al compartir.
- Se conserva el sitemap de categorías y productos y el SEO de las fichas.
- Se conserva el ajuste anterior del carrito móvil.

## 1. Publicar el proyecto actualizado

1. Descomprime el ZIP y sustituye los archivos del proyecto por esta versión.
2. En el proyecto de Vercel, abre Environment Variables.
3. Si existe `INDEXING_ENABLED`, usa el valor `true` en **Production**.
   Si está en `false`, esta versión seguirá bloqueando la indexación.
4. Publica un nuevo despliegue de **Production**. Un cambio de variable requiere
   volver a desplegar; no basta con guardarlo en el panel.
5. Comprueba que el dominio oficial abre la tienda:
   https://www.evolucionurbana.store/
6. Abre https://www.evolucionurbana.store/robots.txt y confirma que indica
   `Allow: /`, con la excepción `/api/`, y no un `Disallow: /` general.
7. Comprueba que https://www.evolucionurbana.store/sitemap.xml muestra URLs
   de la tienda. El carrito no se incluye en ese sitemap y conserva noindex.

## 2. Añadir la tienda a Google Search Console (gratis)

Abre https://search.google.com/search-console e inicia sesión con tu cuenta Google.

### Opción recomendada: propiedad de Dominio

1. Añade una propiedad de tipo **Dominio**: `evolucionurbana.store`.
   Escribe solo el dominio, sin https ni www.
2. Copia el registro TXT de verificación que te dé Google.
3. Añádelo a los DNS que gestionan el dominio. Usa el proveedor al que apuntan
   tus nameservers; puede ser Namecheap, Vercel u otro.
4. Para el registro TXT raíz, el host suele ser `@` o vacío, según el proveedor;
   el valor debe ser exactamente la cadena que genera Google.
5. Vuelve a Search Console y pulsa Verificar. Si aún no aparece el TXT,
   espera a que se propague y vuelve a intentarlo. Conserva el registro.

### Alternativa sin editar DNS: propiedad de Prefijo de URL

1. Añade una propiedad para `https://www.evolucionurbana.store/`.
2. Elige el método **Etiqueta HTML**. Google mostrará una etiqueta con
   `name="google-site-verification"` y un atributo `content`.
3. Copia solo el valor de `content` en la variable `GOOGLE_SITE_VERIFICATION`
   de Vercel para Production. No copies la etiqueta completa.
4. Vuelve a desplegar. Esta versión añade la etiqueta automáticamente.
5. Pulsa Verificar en Search Console. Conserva la variable.

## 3. Enviar el sitemap y solicitar indexación

1. En Search Console, abre **Sitemaps** y envía:
   https://www.evolucionurbana.store/sitemap.xml
2. En **Inspección de URLs**, pega https://www.evolucionurbana.store/.
3. Pulsa **Probar URL publicada**. Si Google puede acceder y la indexación está
   permitida, pulsa **Solicitar indexación**.
4. Haz lo mismo con `/catalogo` y unas pocas fichas principales. El sitemap
   permite descubrir el resto; no necesitas solicitar cada producto a mano.
5. Revisa los informes de Indexación de páginas y Rendimiento para ver
   qué páginas entran y con qué búsquedas te encuentran.

## 4. Mejoras gratuitas para la marca

- Usa el mismo nombre, Evolución Urbana, en web y perfiles sociales.
- Pon el enlace del dominio oficial en las biografías y publicaciones relevantes.
- Comprueba que los perfiles sociales enlazados en la tienda son los tuyos.
- Mantén descripciones originales y claras de productos: tipo de prenda,
  materiales reales, tallas, uso y condiciones de entrega que puedas cumplir.
- Mantén disponibles las páginas de contacto, envíos y la historia de la marca.
- No es necesario comprar anuncios para solicitar indexación en Google.

## Qué esperar

El rastreo puede tardar días o semanas. Solicitarlo no garantiza que una página
se indexe ni que alcance una posición concreta. Google decide el título y el
nombre que muestra. Los enlaces extra debajo del resultado (Catálogo,
Contacto, etc.) también se generan automáticamente; no hay un botón que los
active. Esta actualización elimina el bloqueo técnico y mejora la identificación
de la marca, pero debe publicarse antes de solicitar indexación.

## Fuentes oficiales

- Search Console: https://support.google.com/webmasters/answer/9128668?hl=en
- Verificar propiedad: https://support.google.com/webmasters/answer/9008080?hl=es
- Solicitar rastreo: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=es
- Sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=es
- Nombre del sitio: https://developers.google.com/search/docs/appearance/site-names?hl=es
- Enlaces de sitio: https://developers.google.com/search/docs/appearance/sitelinks?hl=es
- Variables de Vercel: https://vercel.com/docs/environment-variables/system-environment-variables
