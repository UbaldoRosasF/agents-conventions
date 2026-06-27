# Estilizar una app de terceros (render dinámico) desde Figma

Workflow reproducible para clavar el diseño de Figma sobre el HTML que una app de Shopify
inyecta dinámicamente. Caso de referencia ya implementado: `ship-zip`
(`zrc/styles/apps/ship-zip/ship-zip.css` + `snippets/custom-main-product-apps.liquid`).

> Carga primero, si las necesitas: `.agents/css/conventions.md`, `.agents/css/architecture.md`,
> `.agents/css/postcss.md`. Y la regla de oro del proyecto: **nunca** corras `bun run build` / `bun run dev`.

## A. Cuándo usar esto (y cuándo no)

- **Sí:** la app renderiza su propio HTML vía un bloque `@app` (o un script). No controlas ese markup;
  solo puedes intervenir con **CSS** (`zrc/styles/apps/…`) y con el **wrapper Liquid** donde se inyecta.
- **No:** secciones/snippets propios del theme → usa el flujo normal de secciones, no este workflow.

## B. Insumos a pedir al usuario (si no los dio)

1. **`outerHTML` renderizado** del contenedor de la app (DevTools → clic derecho sobre el contenedor →
   *Copy* → *Copy outerHTML*). Es la única fuente fiable de las clases/IDs reales a targetear.
2. **Link del nodo de Figma** (selecciona el frame → *Copy link*; debe incluir `?node-id=...`).

No avances sin ambos: el HTML define los selectores; Figma define los valores.

## C. Extraer specs de Figma

Del URL extrae `fileKey` y `nodeId` (`…/design/:fileKey/:name?node-id=1-239` → fileKey `:fileKey`,
nodeId `1:239`). Luego, con las herramientas del MCP de Figma:

- `get_design_context` → código de referencia + **URLs de assets** (íconos/SVG).
- `get_screenshot` → imagen para comparar visualmente.
- `get_variable_defs` → variables/tokens del diseño (si las hay).

## D. Reconciliar diseño vs markup real

Construye una tabla **elemento de Figma → ¿existe en el HTML? → cómo se resuelve**. Para lo que el
diseño tiene pero el HTML **no** entrega, **pregunta al usuario** cómo agregarlo:

1. **CSS puro** — pseudo-elementos `::before`/`::after` (ícono como `background` SVG; texto vía `content`).
2. **Inyectar markup real** en el wrapper Liquid (mejor a11y/SEO/i18n).
3. **Omitir** — solo restilizar lo que la app ya entrega.

⚠️ Advierte el trade-off: texto en `content:` **no** es traducible, indexable ni accesible. Para copy
real, preferir inyectar en Liquid.

## E. Extraer e incrustar los SVG

1. Descarga los asset URLs de `get_design_context` al scratchpad e inspecciónalos (`curl` + `cat`;
   suelen venir como SVG con `fill="var(--fill-0, #RRGGBB)"`).
2. Limpia el SVG: agrega `xmlns`, fija `width`/`height` y `viewBox`, y reemplaza el `fill` por el color
   del token del theme correspondiente.
3. Incrústalo como **data-URI URL-encoded** (evita archivos extra y peticiones). Usa este snippet:

```python
from urllib.parse import quote
svg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="#30963f"><path d="…"/></svg>'
print("url('data:image/svg+xml," + quote(svg, safe='/:=" ') + "')")
# El #RRGGBB queda como %23RRGGBB; usar comillas simples en url() y dobles en los atributos.
```

## F. Mapear valores de Figma → tokens del theme

Antes de hardcodear, busca equivalente en `zrc/styles/theme/variables/{colors,fonts,general}.css` y usa
`var(--token)`. Mapeos frecuentes (verifícalos en cada caso):

| Figma | Token probable |
|-------|----------------|
| verde éxito `#30963f` | `--success-color` |
| texto principal `#121212` | `--primary-color` |
| borde `#dedede` | `--border-color` |
| gris placeholder `#919191` | `--strikethrough-color` |
| gris muted | `--muted-text-color` |
| superficie gris clara | `--surface-muted` |
| Inter / Montserrat | `--secondary-font` / `--primary-font` |

Muestra al usuario una tabla de mapeo. Si un color del diseño no tiene token y se repetirá, conviene
proponer agregarlo a `variables/` (no crear custom properties locales ad-hoc).

## G. Crear los archivos CSS

Ubicación: `zrc/styles/apps/{vendor}/[{component}/]index.css` (entry) + `{name}.css` (partial).

```css
/* index.css */
@import './{name}.css';
```

El bundler genera `assets/css-{segmentos}.css` (omite `apps` cuando es hija directa de `styles/`; ej.
`apps/ship-zip/index.css` → `css-ship-zip.css`, pero `apps/klaviyo/back-in-stock/index.css` →
`css-apps-klaviyo-back-in-stock.css`). Verifica el nombre real en `builder.mjs` si dudas.

**`zrc/styles/apps/**` está excluido de Stylelint** → aquí **sí** puedes usar IDs y `!important` (a
diferencia del resto del theme). Aun así, mantén el código ordenado y comentado.

## H. Scoping y especificidad (la parte que más falla)

La app inyecta su propio `<style>` **en el `<body>`**; tu bundle carga en el `<head>`. A **igual
especificidad gana el inline del body** (va después en el DOM). Reglas:

1. **Scopea TODO bajo la clase wrapper del theme** donde se renderiza la app (p. ej.
   `.custom-main-product-apps`). Esto (a) namespacea para no filtrar a otros elementos y (b) **suma una
   clase extra de especificidad** para ganarle al inline de la app sin `!important`.
2. Si el contenedor de la app es genérico (clases tipo `.Panel`), acota con **`:has()`** al subárbol de
   *esa* app: `.wrapper .Panel:has(.AppRoot) { … }`.
3. Usa `!important` **solo** para vencer atributos `style="…"` **inline en el elemento** (eso no se gana
   con especificidad). Un `<style>` inline sí se gana con la clase extra del punto 1.

## I. No romper el JS de la app

La app adjunta handlers a sus elementos (submit, inputs, etc.). **No los desactives** al estilizar:
- Para "ocultar" el texto de un botón que dispara JS, usa `font-size: 0` / `color: transparent` /
  `opacity`, **nunca** `display: none` ni `visibility: hidden` sobre el trigger.
- Mantén los elementos en el flujo/clickables (un botón-ícono superpuesto con `position: absolute` sigue
  recibiendo el click).
- No renombres ni reestructures lo que el JS busca por ID/clase.

## J. Cargar el bundle

Carga el CSS con `stylesheet_tag` en el snippet/section donde la app se renderiza (al inicio, antes de
abrir el wrapper). No lo pongas global salvo que la app aparezca en todo el sitio.

```liquid
{{ 'css-{name}.css' | asset_url | stylesheet_tag }}
```

Si tocas un snippet, recuerda el header `{%- doc -%}` (convención Liquid del repo).

## K. Build

**Nunca** corras `bun run build` / `bun run dev`. Pide al usuario que recompile en su terminal para
regenerar `assets/css-{name}.css`.

## L. Verificación

1. Pedir al usuario que recompile y cargue la página donde aparece la app.
2. Comparar contra el screenshot de Figma (estado vacío **y** los estados que la app genera: resultados,
   error, loading — aunque Figma no los muestre, déjalos coherentes con los tokens).
3. Probar el **flujo real**: que los handlers de la app sigan funcionando tras el restyle.
4. Responsive: verificar que el componente no desborde a anchos móviles.
5. Confirmar que los estilos **no se filtran** fuera del scope (`:has()` / clase wrapper).

## M. Checklist de entrega

- [ ] `index.css` importa el partial; partial con todo scopeado bajo el wrapper del theme.
- [ ] SVGs incrustados como data-URI, recoloreados con tokens.
- [ ] Valores mapeados a `var(--token)` donde existía equivalente.
- [ ] `!important` solo contra atributos `style="…"` inline.
- [ ] JS de la app intacto (nada de `display:none` sobre triggers).
- [ ] Bundle cargado con `stylesheet_tag` donde corresponde.
- [ ] No se corrió build; se pidió al usuario recompilar.
