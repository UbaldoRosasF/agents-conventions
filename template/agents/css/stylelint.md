# Stylelint

Config: [`.stylelintrc`](../../.stylelintrc). Extiende `@shopify/stylelint-plugin` + `stylelint-order`.

## Rutas ignoradas

`node_modules`, `*.js`, `*.liquid`, `assets/*.css`, `zrc/styles/apps/**/*.css`

## Reglas activas clave

| Regla | Valor | Significado |
|-------|-------|-------------|
| `selector-no-qualifying-type` | true (ignore: class) | `.btn` no `button.btn` |
| `selector-max-specificity` | `0,4,0` | Máx. 4 clases, sin IDs |
| `selector-max-combinators` | `4` | Profundidad máxima de nesting |
| `selector-max-class` | `4` | |
| `declaration-block-no-duplicate-properties` | true | |
| `no-duplicate-selectors` | true | |
| `function-no-unknown` | null | Permite `responsive()`, `bp()`, `formula()` |
| `color-no-hex` | null | Hex permitido |

## Reglas deshabilitadas (intencional)

Colores hex, colores nombrados, patrones de naming class/id, animaciones desconocidas, valores PostCSS custom — relajados. Ver `.stylelintrc` para la lista completa de `null`.

## Orden de propiedades

Forzado por `order/properties-order`. Propiedades no listadas van **al final** (`unspecified: bottom`).

### Secuencia de grupos

1. `content`, `position`
2. **Grupo position** — inset, top/right/bottom/left, transform*, translate*, scale*, rotate*, skew*, perspective, z-index
3. `visibility`, `opacity`, `display`
4. **Grupo flex/grid** — flex-*, grid-*, gap, order
5. **Width** — width, max/min-width
6. **Height** — height, max/min-height
7. `aspect-ratio`
8. **Background**
9. **Padding**
10. **Border / border-radius**
11. **Margin**
12. **Overflow**
13. **Typography** — font-*, line-height, color, text-*

## Ejecutar

Via extensión Stylelint en VS Code (recomendada en README del proyecto) o:

```bash
bunx stylelint "zrc/styles/**/*.css"
```
