# Arquitectura CSS (bundling)

Referencia para crear bundles nuevos y entender el naming de output. El mapa de carpetas, el patrón de
entry file y las reglas de `@import` viven en [conventions.md](conventions.md).

## Bundling (`builder.mjs`)

| Regla | Detalle |
|-------|---------|
| Entry files | Solo `index.css` bajo `zrc/` |
| Output | `assets/css-{segments}.css` |
| Segmentos omitidos | `sections`, `templates`, `styles`, `scripts` |
| Excepción theme | `styles/theme/` conserva `theme` en el nombre → `css-theme.css` |
| Subcarpeta styles | Se omite una carpeta hija directa de `styles/` (excepto `theme`) |

| Fuente | Salida |
|--------|--------|
| `zrc/styles/theme/index.css` | `css-theme.css` |
| `zrc/styles/sections/featured-collection/index.css` | `css-featured-collection.css` |
| `zrc/styles/templates/product/main/index.css` | `css-product-main.css` |
| `zrc/styles/apps/klaviyo/back-in-stock/index.css` | `css-apps-klaviyo-back-in-stock.css` |

## Dos modos de entrega

| Alcance | Cómo carga |
|---------|------------|
| **Global** | Partials importados en `theme/index.css` (variables, utils, layout, componentes compartidos) |
| **Sección/template** | Propio `index.css` → propio bundle → `stylesheet_tag` en el Liquid correspondiente |

Los componentes compartidos **no** tienen bundle standalone — agregar `@import` en `theme/index.css`.
El entry de theme encadena: typography → variables → utils → vendors → theme → components → layout → apps.

## Integración Liquid

```liquid
{{ 'css-featured-collection.css' | asset_url | stylesheet_tag }}
```

## Pipeline de build

```
zrc/styles/**/index.css
  → postcss-functions   (responsive, bp, formula)
  → postcss-import
  → postcss-nesting
  → ESBuild → assets/
  → Stylelint
```

## No editar

| Ruta | Motivo |
|------|--------|
| `assets/css-*.css` | Output generado |
| `zrc/styles/apps/` (parcial) | Terceros; excluido de Stylelint en subcarpetas apps |
