# Publicación conjunta de noviembre

Precios Anime Shop: 1 $68.000; 2 $93.000; 3 $126.000; 4 $156.000; 5 $185.000. No se cambian diseños, rutas, fotografías ni CSS del catálogo. Se actualizan cotización, condiciones, exportación IA y la compatibilidad con la tarifa anterior de una publicación persistente. Una tarifa posterior personalizada por el propietario no se sobrescribe por esa compatibilidad.

## Arquitectura y activación

Estado verificado el 2 de noviembre de 2026: migración aplicada en el proyecto existente eustore-catalogo (organización Evolución Urbana, plan FREE), con resultado «Success. No rows returned». Variable EUSTORE_TRAFFIC_ENABLED=1 creada únicamente para producción en Vercel. No se realizó push ni despliegue. La medición nueva comenzará con la publicación conjunta; no está activa todavía en el catálogo publicado.

- GitHub es el origen de la publicación del catálogo en Vercel. No hacer push a la rama conectada hasta revisar todos los cambios para evitar despliegues intermedios.
- BackOffice 0.7.0 sigue en el computador, accesible mediante Cloudflare. Hay que reiniciar INICIAR_WINDOWS.cmd para cargar el código nuevo y luego entrar en CRM > Tráfico web. Conservar runtime y la cuenta propietaria; no reemplazar la base con el seed.
- La migración local scripts/apply-november-prices.mjs respalda SQLite, verifica las tarifas previas exactas y registra el cambio de reglas. No publica productos ni altera cotizaciones/pedidos existentes.
- El tráfico usa el proyecto Supabase ya existente. Aplicar database/migrations/20261102_traffic.sql antes del único despliegue y revisar cuotas actuales del proyecto. No se ha contratado un nuevo plan ni se garantiza que el uso sea ilimitado.
- Configurar EUSTORE_TRAFFIC_ENABLED=1 en el entorno de producción de Vercel antes de ese despliegue. Se reutilizan EUSTORE_SUPABASE_URL, EUSTORE_SUPABASE_SERVICE_KEY y EUSTORE_PUBLISH_TOKEN privados. No colocar estas credenciales en NEXT_PUBLIC ni GitHub.
- El cliente no activa medición con la bandera en 0. No crear un despliegue separado para configurarla; preparar almacenamiento y variables antes de publicar el conjunto.

## Verificación después de publicar

1. Comparar las cinco tarjetas de precios, selección de varias referencias y mensaje de WhatsApp con las tarifas aprobadas. Comprobar que las demás líneas conservan sus precios.
2. Publicar posteriormente las reglas revisadas desde BackOffice permite que el documento persistente también almacene las tarifas nuevas. La compatibilidad del código cubre sólo la tabla anterior exacta hasta esa publicación; no fuerza tarifas futuras.
3. Abrir el catálogo desde una sesión de prueba sin DNT/GPC: una página vista y luego un clic a WhatsApp. No enviar el mensaje.
4. Desde el BackOffice reiniciado, abrir CRM > Tráfico web. Verificar sesiones, ruta y clic; éstos NO son ventas. La lectura necesita cuenta con permiso CRM y la clave privada del conector.
5. Verificar /api/backoffice/traffic-summary sin autenticación: debe devolver 401. La base no permite lectura/escritura de tráfico a anon ni authenticated.
6. Probar una solicitud con GPC o DNT: no debe registrar actividad.

## Límites prácticos

Sesiones activas: actividad recibida en los últimos 90 segundos. El navegador envía señal cada 45 segundos sólo estando visible; el CRM consulta cada 15 segundos y deja de hacerlo al ocultarse. No son personas identificadas: varias pestañas/dispositivos pueden sumar sesiones. No se crean clientes ni pedidos automáticamente.

La procedencia es un dominio y la campaña usa sólo utm_campaign validada (máximo 80 caracteres alfanuméricos, espacio, punto, guion y guion bajo). No se recopilan fbclid, texto de WhatsApp, búsqueda, IP persistente ni rutas con parámetros. El límite por sesión y la deduplicación reducen ruido, pero no garantizan excluir todo bot. La limitación por IP existe sólo en memoria del servidor y no es un firewall distribuido.

Historial visible de 30 días; limpieza de datos con antigüedad superior a 31 días durante la ingesta o consulta. Si no existe actividad, la limpieza ocurre en la próxima ingesta/consulta. No se puede reconstruir tráfico anterior a la activación. El PC puede estar apagado y la web seguirá registrando en Supabase; el panel privado requiere PC, conexión y túnel encendidos.

Si el almacenamiento falla, la compra continúa: el cliente detiene su envío hasta una nueva navegación. El CRM muestra error explícito, sin presentar datos inventados como cero visitas. Desactivar la bandera de tráfico requiere otra publicación para retirar el cliente; no borrar tablas con datos sin revisión.
