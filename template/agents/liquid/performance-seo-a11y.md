# Performance, SEO y accesibilidad

Requisitos transversales para todo output Liquid.

## Performance

### Imágenes

| Regla | Detalle |
|-------|---------|
| `src` | Una sola URL via `image_url` — **sin** `srcset`, `sizes`, `widths`, ni attrs `width`/`height` en la etiqueta fallback `<img>`. |
| Responsivo | Usar etiqueta `<picture>` con múltiples `<source media="(...)">` y filtros `image_url` específicos para servir diferentes resoluciones según el viewport. |
| `loading` / `fetchpriority` | Si la sección es la primera en renderizarse (`section.index == 1`) y la imagen es la primera en el loop (`forloop.index == 1`), usar `fetchpriority="high"`. De lo contrario, usar `loading="lazy"`. |
| `alt` | Siempre desde `.alt` del objeto Liquid (ej. `image.alt`). |
| Sizing | Solo CSS — nunca `width`/`height` en `<img>`. |

Evitar patrones lazysizes/bgsizes deprecados (Theme Check los marca).

### CSS y JavaScript

- Assets de sección desde bundles `zrc` — un CSS + un JS por sección cuando haga falta
- Evitar scripts inline parser-blocking (Theme Check: `ParserBlockingJavaScript`)
- JS de sección: `<script src="{{ 'js-{name}.js' | asset_url }}" defer></script>` al final del markup de sección
- JS global en layout: mismo patrón con `defer`
- No cargar bundles duplicados — global en layout, específico de sección solo en la sección
- Preload de fuentes/imágenes críticas: filtro `preload_tag` cuando aplique

### Eficiencia Liquid

- Minimizar trabajo dentro de `{% for %}` — assign/filter antes del loop
- Remover `{% assign %}` sin usar (Theme Check: `UnusedAssign`)
- Nesting de snippets **máx. 3 niveles** (Theme Check: `NestedSnippet`)
- Archivos de sección **máx. 500 líneas** excluyendo schema/stylesheet/javascript (Theme Check: `TemplateLength`)
- Paginar collections con 50+ productos

### Terceros

- Snippets de apps en ignore list — no refactorizar código vendor salvo que se pida
- Preferir objetos nativos de Shopify sobre fetches HTTP extra en Liquid

## SEO

### Meta del documento (layout)

- `{{ page_title }}` y meta description via `page_description` o settings de sección
- `{{ canonical_url }}` en `<head>`
- `{{ content_for_header }}` sin modificar (Theme Check: `ContentForHeaderModification`)

### Structured data

```liquid
{{- product | structured_data -}}
```

Usar filtros Shopify para product, article, organization según corresponda.

### Estructura de contenido

- **Un `<h1>`** por página — jerarquía lógica dinámica: usar `<h1>` si la sección es la primera en renderizarse (`section.index == 1`), de lo contrario usar `<h2>` u otros encabezados inferiores.
- Texto de enlace descriptivo — evitar "click here"
- `href` en links crawlables; usar `<button>` para acciones
- Alt text desde `image.alt` (u objeto equivalente)

### URLs e i18n

- Usar objeto `routes` para links internos (`routes.cart_url`, `routes.root_url`)
- Contenido traducido via locale files, no templates duplicados
- Objeto `localization` para market/language switchers cuando aplique

## Accesibilidad (WCAG 2.1)

### Semántica y teclado

- Elementos interactivos nativos: `<button>`, `<a href>`, `<input>` con `<label>`
- Controles custom: `role`, `tabindex`, handlers de teclado (preferir `<dialog>` para modals)
- Focus visible — no remover outline sin reemplazo
- Skip link a `#main` en layout

### ARIA

- `aria-hidden="true"` en iconos decorativos
- `aria-expanded`, `aria-controls` en toggles
- Live regions (`aria-live`) para updates dinámicos de cart/variant
- Modals: trap focus, `Escape` cierra, restaurar focus al cerrar

### Media

- Video: captions/transcripts cuando lleve contenido
- Autoplay: muted + sin info esencial solo-audio
- Contraste: confiar en tokens del theme en `zrc/styles/theme/variables/`

### Forms

- Labels explícitos (`for`/`id` o label envolvente)
- Errores: `{{ form.errors | default_errors }}`
- Campos requeridos: `required` + indicación accesible en label

## Checklist (nivel sección)

- [ ] Imágenes: un `src`, `loading="lazy"`, `alt` desde `.alt` — sin srcset/sizes/width/height
- [ ] Sin scripts parser-blocking
- [ ] Un h1; headings lógicos
- [ ] Todas las strings traducidas
- [ ] Forms con labels; errores expuestos
- [ ] Elementos interactivos accesibles por teclado
- [ ] `structured_data` donde aplique
