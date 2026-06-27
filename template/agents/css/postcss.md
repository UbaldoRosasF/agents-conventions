# PostCSS

Config: [`postcss.config.js`](../../postcss.config.js). Aplicado en build vía `esbuild-postcss`.
La decisión de **cuándo** usar cada función (`responsive()` solo tipografía no-botón, `bp()` botones +
demás propiedades numéricas) está en [conventions.md](conventions.md); aquí solo los parámetros.

## Orden de plugins

| # | Plugin | Rol |
|---|--------|-----|
| 1 | `postcss-functions` | `responsive()`, `bp()`, `formula()` |
| 2 | `postcss-import` | Resolver `@import` |
| 3 | `postcss-nesting` | Compilar nesting `&` |

`postcss-sort-media-queries` y `postcss-sorting` están en `package.json` pero **no** habilitados.

## Funciones fluidas

Todas expanden a `clamp()` o `calc()` en build time. Valores numéricos sin unidad → output en `px`.

### `responsive(min, max, minVw?, maxVw?, negative?)`

| Param | Default | Notas |
|-------|---------|-------|
| min, max | — | bounds en px |
| minVw | `360` | Inicio del rango |
| maxVw | `1440` | Fin del rango |
| negative | `false` | Envuelve en `calc(... * -1)` |

```css
.title { font-size: responsive(24, 36); }
```

### `bp(min, max, breakpoint?)`

| Param | Default | Notas |
|-------|---------|-------|
| min, max | — | px mobile → desktop |
| breakpoint | `834` | Viewport donde empieza el escalado; determinarlo según la sección |

```css
.btn { font-size: bp(14, 16); }
.section { padding-inline: bp(16, 48); gap: bp(12, 24); }
.product-list { gap: bp(12, 16, 699); }
```

### `formula(min, max, minVw, maxVw)`

| Param | Notas |
|-------|-------|
| min, max | bounds en px |
| minVw, maxVw | rango de viewport explícito |

**Uso:** escalado lineal entre viewports definidos — cuando `responsive()` / `bp()` no encajan.

```css
/* formula(10, 20, 1024, 1440) */
.custom { width: formula(10, 20, 1024, 1440); }
```

## Referencia rápida

| Función | Tipografía (no botón) | Tipografía botón | Spacing / otro fluido | Valores discretos |
|---------|----------------------|------------------|----------------------|-------------------|
| `responsive()` | ✓ | ✗ | ✗ | ✗ |
| `bp()` | ✗ | ✓ | ✓ | ✗ |
| `formula()` | caso a caso | caso a caso | caso a caso | ✗ |

## Nesting e imports

Nesting: sintaxis nativa `&`. Imports: inicio del archivo, rutas relativas. Sin Sass/Less.

## Agregar una función

1. Añadir en `postcss.config.js` → `postcss-functions.functions`
2. Documentar aquí
3. Verificar manualmente solo si se pide: `bun run build`
