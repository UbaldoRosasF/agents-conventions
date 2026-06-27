# Instrucciones para agentes

Documentación universal para cualquier agente de IA. **Leer antes de modificar este repo.**

Shopify theme (workflow Getmore): fuentes en `zrc/`, bundles en `assets/`. Build: ESBuild + PostCSS. Lint: Stylelint (CSS), StandardJS (JS).

**Nunca ejecutar `bun run build` ni `bun run dev`.** El desarrollador siempre mantiene otra terminal con el servidor/watch corriendo y recompila los bundles. Si hace falta validar compilación o bundles, pedirle al usuario que lo ejecute.

## Documentación

Docs base (cargar al tocar esa área):

| Ruta | Cuándo consultar |
|------|------------------|
| [css/conventions.md](css/conventions.md) | CSS en `zrc/styles/` — fuente única de reglas (autosuficiente) |
| [javascript/conventions.md](javascript/conventions.md) | JS en `zrc/scripts/` — fuente única de reglas (autosuficiente) |
| [liquid/conventions.md](liquid/conventions.md) | Liquid en carpetas del theme — fuente única de reglas (autosuficiente) |

### Cargar bajo demanda

Estos docs **no** se cargan al inicio de la sesión (para no pesar siempre). Cualquier agente debe leerlos
solo cuando la tarea lo amerite:

| Doc | Cargar cuando |
|-----|---------------|
| [css/architecture.md](css/architecture.md) | Creas un bundle CSS nuevo o necesitas el naming de output / pipeline de `builder.mjs`. |
| [css/postcss.md](css/postcss.md) | Escribes CSS con valores fluidos y debes elegir `bp()` / `responsive()` / `formula()` o sus parámetros. |
| [css/stylelint.md](css/stylelint.md) | Resuelves errores de Stylelint, o necesitas el orden de propiedades / límites de selectores. |
| [javascript/architecture.md](javascript/architecture.md) | Creas un bundle JS nuevo o necesitas el naming de output / toolchain de `builder.mjs`. |
| [javascript/eslint.md](javascript/eslint.md) | Resuelves errores de ESLint / StandardJS. |
| [liquid/architecture.md](liquid/architecture.md) | Necesitas orientarte en la estructura del theme (carpetas, roles de archivo, integración Getmore). |
| [liquid/theme-check.md](liquid/theme-check.md) | Resuelves errores de Theme Check o dudas sobre sus reglas. |
| [liquid/performance-seo-a11y.md](liquid/performance-seo-a11y.md) | Construyes/editas sections, templates o markup con imágenes / SEO / a11y. |
| [workflows/style-app-from-figma.md](workflows/style-app-from-figma.md) | Estilizas una app de terceros de render dinámico (bloque `@app`) desde un diseño de Figma. |

> El hook PostToolUse ya corre Stylelint / ESLint / Theme Check **en vivo** sobre cada archivo editado;
> carga esos tres docs solo si necesitas el detalle de las reglas, no para el feedback básico.

## Reglas críticas

### CSS

> Resumen. Detalle, ejemplos y patrones → [css/conventions.md](css/conventions.md) (fuente única).

1. No editar `assets/css-*.css` — solo `zrc/styles/`
2. Entry: un `index.css` por bundle; componentes compartidos importados en `theme/index.css`
3. `responsive()` → propiedades de tipografía (`font-size`, `line-height`, `letter-spacing`), **no botones**
4. `bp()` → tipografía de botones + cualquier otra propiedad que cambie su valor numérico (usando como tercer parámetro el breakpoint analizado de la sección correspondiente)
5. `:hover` dentro de `@media (hover: hover)`
6. Tokens de marca (color/fuente/escalas) → siempre en `variables/`. Se permiten custom properties locales con propósito (ej. alternar un valor entre estados sin repetir selectores). Nunca borrar ni renombrar custom properties existentes; modificar su valor si hace falta.
7. Custom elements contenedores (secciones desde cero): Definir `display: block` sobre la etiqueta en CSS.

### JavaScript

> Resumen. Detalle, ejemplos y patrones → [javascript/conventions.md](javascript/conventions.md) (fuente única).

1. No editar `assets/js-*.js` — solo `zrc/scripts/`
2. Entry: un `index.js` por bundle — raíz de composición delgada
3. Web Components + cleanup completo en `disconnectedCallback`
4. Un módulo por responsabilidad; utilidades → named exports
5. jQuery: capturar `window.jQuery` a nivel de módulo si hace falta
6. StandardJS — sin punto y coma forzado
7. Carruseles desde cero: Usar de forma obligatoria **Swiper** (analizar su uso en otros archivos JS de `zrc/`)

### Liquid

> Resumen. Detalle, ejemplos y patrones → [liquid/conventions.md](liquid/conventions.md) (fuente única).

1. Usar `{%- render -%}`, nunca `{%- include -%}`
2. Todo texto visible → claves de traducción + locales (secciones creadas desde cero no deben conectarse a traducción automática; ingresar traducciones manualmente)
3. Snippets con `{%- doc -%}`; sections/blocks con `{%- schema -%}` válido
4. **Todos** los tags Liquid con whitespace trimming (`{%-` / `-}}` / `{{-` / `-}}`)
5. Iniciar sections, snippets y `{%- for -%}` con `{%- liquid -%}` — asignar variables al inicio
6. Cargar bundles de `zrc` vía `asset_url` — no duplicar en `{% stylesheet %}`
7. Imágenes: usar etiqueta `<picture>` para responsive; LCP optimizado (`fetchpriority="high"` si `section.index == 1` y `forloop.index == 1`), si no `loading="lazy"`; `alt` desde `.alt`
8. SEO: jerarquía de encabezado dinámica (`h1` si `section.index == 1`, si no `h2`), structured data, canonical/meta en layout
9. A11y: HTML semántico, labels, alt, soporte de teclado

### Figma

Al implementar desde diseño visual, usar las herramientas del MCP de Figma (`get_design_context`, `get_screenshot`, `get_variable_defs`) para extraer specs **antes** de generar código. Para **estilizar apps de terceros que renderizan HTML dinámicamente** desde un diseño de Figma, seguir [workflows/style-app-from-figma.md](workflows/style-app-from-figma.md). Si hay conflicto con este archivo o [AGENTS.md](AGENTS.md), **AGENTS.md tiene prioridad** para convenciones del proyecto.

## Comandos

```bash
bun run dev      # NO ejecutar; el usuario lo mantiene en otra terminal
bun run build    # NO ejecutar; pedir al usuario que compile si hace falta
bun run pull     # obtener archivos del theme
bun run push     # subir archivos al theme
```

No correr build/dev después de editar. El usuario recompila desde su propia terminal.

## Config

| Archivo | Propósito |
|---------|-----------|
| `builder.mjs` | Entry points y nombres de bundles |
| `shopify.theme.toml` | Theme ID y entorno dev |
| `.stylelintrc` | Lint CSS + orden de propiedades |
| `postcss.config.js` | `responsive()`, `bp()`, `formula()`, nesting |
| `package.json` → `eslintConfig` | Lint JS |
| `.prettierrc` | Formato (CSS/JSON) |
| `.theme-check.yml` | Reglas Theme Check |
