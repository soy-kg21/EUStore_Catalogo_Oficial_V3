# Evolución Urbana: actualización premium

Base: EUStore_Ultima_Actualizacion_22-09-26-11-50pm.zip, integrada sobre el sitio existente.

## Cambios
- Cabecera oscura translúcida con logo.png original, iconos y anuncio continuo verde eléctrico.
- Videos con encuadre completo y versiones móvil/ordenador; control de pausa animado y respeto a movimiento reducido.
- Portada, categorías compactas, tarjetas, detalle, filtros y páginas informativas con estilo coherente.
- Búsqueda modal con sugerencias y resultados reales, fotos y precios.
- Carrito lateral con selección persistente, cálculo comercial existente, cierre sin perder la página y enlaces de WhatsApp.
- Filtros plegables en móvil, menú adaptado a tablet, enlaces originales de Instagram y WhatsApp.
- Movimiento nativo con IntersectionObserver, requestAnimationFrame y CSS; no se añadieron dependencias 3D.

## Comprobaciones
- Las 253 referencias coinciden con el Excel maestro en ID y precio. Se conservan los estados; 251 visibles, 2 inactivas.
- Todas las imágenes de producto referenciadas existen.
- TypeScript sin errores.
- Navegador: portada escritorio, vistas de 390 y 768 px; corrección de desbordamiento en tablet.
- Búsqueda Vaporfly, selección de talla 38, añadir, cantidad 2, total promocional $216.000, eliminación y cierre del carrito.
- Filtros plegables visibles y utilizables en móvil.

## Pendientes de material
No se recibieron imagenes categorias.zip ni Captura de pantalla 2026-09-23 225140.png. Se conservan las imágenes de categorías existentes. No se añadieron redes sociales sin enlaces verificados en la base. El catálogo clásico adicional no fue adjuntado; se usó EUStore y la hoja maestra.
