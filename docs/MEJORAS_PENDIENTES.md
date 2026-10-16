# Después de revisar la versión 2.0
1. Confirmar los tres colores marcados en migration-register.csv y las tallas excepcionales. Hay 253 referencias sin stock físico registrado.
2. Aprobar vigencia de precios y promociones por bodega. B2 desde 6 pares requiere cotización; B5 desde 41 prendas no debe mostrar un total cerrado. No confundir precio anterior con descuento aprobado: no se muestran precios tachados sin vigencia confirmada.
3. Configurar Supabase y ejecutar esquema/semilla en un proyecto de prueba. Probar políticas con usuario anónimo y credenciales de administración. Conectar almacenes e inventario real por talla.
4. Panel de edición con autenticación, roles y auditoría; en 2.0 se actualiza mediante importación, no hay panel terminado.
5. WhatsApp Cloud API/IA: requiere cuenta empresarial, plantillas/webhooks y servicio propio. El enlace actual entrega contexto, no simula un bot.
6. Validar textos de entrega, cambios, garantía y privacidad con información real del negocio. El texto de privacidad explica esta revisión, no sustituye una política comercial completa.
7. GA4 y Meta: identificadores existentes detectados en código, no activos en revisión. Implementar activación según elección de privacidad y validar eventos de producto, búsqueda, selección y WhatsApp. No disparar Purchase por un simple clic.
8. Migrar activos a un bucket/CDN gestionado si crece el catálogo. Medir Lighthouse y métricas reales después del hosting final; no afirmar puntuaciones no medidas.
9. Lanzamiento: probar Next.js nativo si se elige Vercel, configurar dominio oficial, redirección de dominio raíz a www, TLS, metadatos y sitemap. No se ha modificado el dominio actual.
