# Idealista Extension

Base tecnica para una extension Chrome/Chromium con Manifest V3 y TypeScript pensada para crecer de forma modular.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalacion

```bash
npm install
```

## Build

Compila TypeScript y deja una carpeta `dist/` lista para cargar como extension:

```bash
npm run build
```

Modo desarrollo con recompilacion de TypeScript y sincronizacion de `public/`:

```bash
npm run dev
```

## Cargar en Chrome

1. Ejecuta `npm run build`.
2. Abre `chrome://extensions`.
3. Activa `Developer mode`.
4. Pulsa `Load unpacked`.
5. Selecciona la carpeta `dist` del proyecto.

## Estructura

```text
public/
  manifest.json
  icons/

scripts/
  build.mjs

src/
  background/
    index.ts
  content/
    bootstrap.ts
    index.ts
  core/
    types.ts
  data/
    referenceProvider.ts
  dom/
    pageDetector.ts
  shared/
    errors.ts
    logger.ts
    utils.ts
  ui/
    widgetMount.ts
```

## Responsabilidades por modulo

- `src/content/`: arranque de la content script y bootstrap de la pagina.
- `src/dom/`: deteccion de paginas compatibles y futuras utilidades de lectura del DOM.
- `src/data/`: proveedores de datos externos o internos.
- `src/ui/`: montaje y ciclo de vida del futuro widget.
- `src/core/`: tipos compartidos del dominio de la extension.
- `src/shared/`: utilidades transversales, errores y logging.
- `src/background/`: service worker MV3 para coordinacion futura.

## Siguiente punto de extension

La siguiente tarea natural es implementar un extractor de datos de la ficha dentro de `src/dom/` y orquestarlo desde `src/content/bootstrap.ts`, manteniendo separadas:

- deteccion y lectura del DOM
- resolucion de referencias de datos
- analisis de negocio
- renderizado del widget

## Notas

- La content script solo corre en dominios de Idealista declarados en el `manifest`.
- El bootstrap vuelve a validar la pagina para mantener el punto de entrada defensivo.
- No se ha montado UI ni scraping real todavia.
- La carpeta `public/icons/` queda preparada para recibir iconos reales mas adelante.
