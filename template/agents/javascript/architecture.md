# Arquitectura JS (bundling)

Referencia para crear bundles nuevos y entender el naming de output. El mapa de carpetas, el rol del
entry file (raíz de composición) y las dependencias npm viven en [conventions.md](conventions.md).

## Bundling (`builder.mjs`)

| Regla | Detalle |
|-------|---------|
| Entry files | Solo `index.js` bajo `zrc/` |
| Output dir | `assets/` |
| Naming | `js-{path-segments}.js` |
| Segmentos omitidos | `sections`, `templates`, `styles`, `scripts` |
| Format | ESM, bundled, minificado en producción |

| Fuente | Salida |
|--------|--------|
| `zrc/scripts/theme/index.js` | `js-theme.js` |
| `zrc/scripts/sections/featured-collection/index.js` | `js-featured-collection.js` |
| `zrc/scripts/templates/product/main/index.js` | `js-templates-product-main.js` |
| `zrc/scripts/apps/klaviyo/back-in-stock/index.js` | `js-apps-klaviyo-back-in-stock.js` |

Archivos `.js` que no son entry se incluyen vía `import` y nunca se emiten como assets separados.

## Integración Liquid

```liquid
<script src="{{ 'js-featured-collection.js' | asset_url }}" defer></script>
```

Los custom element tags en markup deben coincidir con nombres definidos en el `index.js` de esa sección.

## Toolchain de build

```
zrc/scripts/**/index.js
  → ESBuild (bundle, ESM → single file)
  → assets/js-*.js
  → ESLint (StandardJS, package.json)
```

PostCSS **no** procesa JS. CSS y JS comparten la convención de entry point (`index.css` / `index.js`) y
el mismo watcher de `builder.mjs`.

## No editar

| Ruta | Motivo |
|------|--------|
| `assets/js-*.js` | Output generado |
| Vendor copies dentro de sections | Código de terceros; tocar solo para upgrade de librería |
