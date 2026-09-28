# EUStore Original Restaurado V3

Proyecto completo de Evolución Urbana actualizado a partir del ZIP proporcionado.
La guía vigente es **LEEME_PRIMERO_V2.txt**. Incluye instalación en Windows,
publicación en el proyecto existente de Vercel, cambios y pruebas realizadas.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build:vercel
```

Utiliza Node >=22.13.0 y pnpm 11.25.0. El servidor local abre en el puerto 5173.
Los comandos principales usan Next.js. No es necesario importar ningún CSS adicional.

Las dependencias y cachés se regeneran y no se incluyen en el ZIP.
El catálogo, los recursos públicos y las reglas comerciales originales se conservan.
Los documentos de fechas anteriores se mantienen como historial; para esta entrega
sigue LEEME_PRIMERO_V2.txt.

Restauración de la interfaz original a partir de premium.css recuperado y las
capturas aportadas. Mantiene Inicio, logotipo, tema y correcciones comerciales.
Los estilos se importan en app/layout.tsx en orden: globals, vídeo, premium y
enhancements. Conserva ese orden para evitar interferencias visuales.
