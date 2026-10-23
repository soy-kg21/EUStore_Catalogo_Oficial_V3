EVOLUCIÓN URBANA · ENTREGA COMPLETA V5.2
Actualiza directamente tu BackOffice V5. No instales V5.1 antes.
Código web base: EUStore_Catalogo_Oficial_V3, rama master, ZIP compartido el 23 de octubre de 2026.
Esta entrega prepara el código y el instalador. No se ha desplegado en tu sitio activo.

1. ACTUALIZAR TU MISMO BACKOFFICE
1) Extrae este ZIP en Descargas.
2) Abre tu BackOffice habitual → Mi sistema.
3) En Archivo de actualización, selecciona EUStore_0.5.2.euupdate.
4) Revisa el salto 0.5.0 → 0.5.2 y pulsa Preparar actualización.
5) Guarda tu trabajo. Detén la ventana negra con Ctrl+C.
6) Abre tu INICIAR_WINDOWS.cmd habitual en la misma carpeta de siempre.
7) Recarga el navegador con Ctrl+F5. Debe aparecer Local 0.5.2.
Se crea un respaldo de cuentas, CRM, datos, fotos y programa automáticamente.

2. PREPARAR EL CONECTOR WEB EN UNA RAMA
El BackOffice es el administrador local. El conector pertenece al catálogo de GitHub.
No metas archivos del catálogo dentro de la carpeta del BackOffice.

1) En GitHub Desktop, abre o clona:
   https://github.com/soy-kg21/EUStore_Catalogo_Oficial_V3
   GitHub Desktop se descarga en https://desktop.github.com/
2) Current branch → New branch → integracion-backoffice-v5-2.
   Créala desde master. No trabajes directamente en master para esta instalación.
3) Repository → Show in Explorer. Copia la ruta de esa carpeta.
4) En este paquete, abre conector-catalogo → PREPARAR_CONECTOR_WINDOWS.cmd.
5) Pega la ruta del repositorio. El instalador verifica que sea tu catálogo y una rama de trabajo.
   Comprueba los archivos antes de escribir; si alguno cambió desde el ZIP compartido, se detiene.
   Conserva las fotos originales. Guarda los archivos previos en un respaldo junto al proyecto.
6) Regresa a GitHub Desktop. Revisa los cambios; registra el commit y publica esta RAMA.
   El instalador no hace push, no fusiona master y no despliega por sí mismo.
7) En GitHub Desktop, pulsa Create Pull Request y créalo en GitHub con destino master.
8) Abre el enlace Deploy Preview de Netlify en ese pull request y revisa /, /catalogo, /shop y una ficha.
   Si tienes compilación local configurada: corepack pnpm install y corepack pnpm build.
   La suite del conector se ejecuta con corepack pnpm test:live-sync.
   Sin activar las variables de conexión, el catálogo conserva su fuente de datos anterior.

3. CONFIGURAR NETLIFY UNA SOLA VEZ
Enlace de acceso: https://app.netlify.com/
Abre el proyecto que sirve evolucionurbana.store.
Project configuration → Environment variables → Add a variable.
La interfaz puede mostrar también Site configuration según la vista de tu cuenta.

1) Abre Productos → Revisar y publicar en el BackOffice actualizado.
2) Dentro de Conectar el catálogo activo, pulsa Generar clave para Netlify.
3) Copia la clave generada en esta variable de Netlify:
   EUSTORE_PUBLISH_TOKEN = la clave privada generada.
   Contexto: Production. Si permite elegir alcances, incluye Functions y Builds.
   Si no aparece ese selector, conserva All scopes / el alcance predeterminado.
   No uses el prefijo NEXT_PUBLIC_ y no la subas a GitHub ni al chat.
4) Agrega:
   EUSTORE_LIVE_CATALOG = 1
   Debe estar disponible durante la compilación y en las Functions de producción.
   El código consulta el almacenamiento en cada petición y evita páginas estáticas desactualizadas.
5) Vuelve al BackOffice, confirma la dirección https://evolucionurbana.store
   y pulsa Guardar y comprobar conexión. Así queda guardada tu clave en este equipo.
   Hasta desplegar el conector, es normal que todavía aparezca sin conectar.
6) Cuando hayas revisado el Deploy Preview, fusiona la rama de integración a master.
   La publicación automática de Netlify instalará el conector en tu dominio habitual.
   Si configuraste las variables después de compilar, ejecuta un nuevo deploy de producción.
7) Espera a que el deploy indique Published. Vuelve a Revisar y publicar → Actualizar revisión.
   Debe decir Conexión web disponible y permitir Publicar cuando haya novedades.
   Si el dominio redirige de www a sin www, usa la dirección final, pues el conector protege la clave evitando redirecciones.

Netlify proporciona el almacenamiento persistente para este conector; no necesitas un VPS para servir el catálogo.
La facturación y los límites dependen de tu plan de Netlify. No se ha contratado ningún servicio adicional desde esta entrega.
Los cambios se guardan en el espacio eustore-catalog-v1 de Blobs de TU proyecto y sobreviven a nuevos deploys.
El conector impide publicar desde Deploy Previews; la escritura se habilita en producción.

4. PUBLICAR TUS NOVEDADES
1) Productos → edita una ficha → Guardar y volver.
2) Arriba, junto a + Agregar producto, pulsa Revisar y publicar.
3) Ver cambios permite comparar Antes/Después: fotos, textos, precios, promociones y tallas.
   Abre los pendientes y corrígelos, o deja esa referencia en borrador.
4) Guardar versión revisada guarda una copia aprobada en este computador.
5) Publicar en catálogo envía la versión completa y la activa cuando el servidor confirma.
   Verás el progreso de fotos y activación. Espera la confirmación antes de cerrar el programa.
6) Una visita nueva verá la versión vigente; las pestañas abiertas comprueban cambios cada 5 segundos mientras están visibles y con conexión.
7) El catálogo sigue disponible con el computador apagado después de publicar.

ANTES DE LA PRIMERA PUBLICACIÓN
La publicación es COMPLETA: el BackOffice pasa a ser la fuente del catálogo activo.
Se incluyen productos activos de bodegas activas; se retiran borradores e inactivos.
Revisa el conteo y tus novedades recientes antes de hacer esa primera publicación.
Las fotografías nuevas se admiten en PNG/JPG/WebP hasta 4 MB; las existentes iguales se reutilizan.
Si falla una carga o hay cambios simultáneos, la versión anterior sigue activa.
Actualiza la revisión y reintenta. Un fallo no se anuncia como una publicación exitosa.

COSTO PRIVADO Y ORDEN
El costo es lo que te cobra el proveedor por UNA unidad: consúltalo en su ficha o lista de precios.
En Productos → Editar producto → Precios encuentras Costo privado junto al precio de venta y normal.
Si no tienes ese dato, déjalo vacío. No es el precio normal tachado y no se muestra al cliente.
En Orden del catálogo, mantén clic izquierdo en ⋮⋮ y arrastra a la posición deseada.
Cerca de los bordes, la lista se desplaza mientras arrastras. También puedes escribir el puesto.
Guarda el nuevo orden y publícalo desde Productos.

ALCANCE
Se conserva el diseño de tu catálogo y la experiencia Anime con su navegación y animaciones.
Se sincronizan productos, nombres propios, fotos, precios, promociones, tallas, cantidades y orden.
Las cotizaciones consultan los datos publicados y rechazan tallas agotadas o cantidades superiores a las registradas.
Cantidad desconocida no se convierte en cero ni en existencias confirmadas.
No se publican costos ni nombres/identificadores privados de proveedores.
Las APIs oficiales de Dropi/MasterShop y WhatsApp siguen pendientes de la documentación y credenciales de cada servicio.
No se procesan pagos ni se envían pedidos automáticamente a esos proveedores.

VALIDACIÓN Y LÍMITES
El código se comprobó con pruebas automáticas y peticiones HTTP entre el BackOffice, Next.js y un almacenamiento simulado.
La prueba no usa tu cuenta de Netlify ni modifica tu dominio.
La publicación en tu alojamiento real y el arrastre nativo de Windows se verifican al instalar.

REFERENCIAS OFICIALES
Ramas de GitHub Desktop:
https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop
Variables de Netlify:
https://docs.netlify.com/build/environment-variables/get-started/
Almacenamiento persistente:
https://docs.netlify.com/build/data-and-storage/netlify-blobs/
