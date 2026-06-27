# Convenciones Liquid

Fuente única de las reglas de Liquid del theme (Shopify Online Store 2.0). Cualquier agente debe poder
aplicar estas reglas leyendo solo este archivo.

- Orientación del theme (carpetas, roles de archivo, integración Getmore) → [architecture.md](architecture.md).
- Imágenes, SEO y accesibilidad → [performance-seo-a11y.md](performance-seo-a11y.md).
- Reglas de Theme Check → [theme-check.md](theme-check.md).

## Reglas críticas

1. **`{%- render -%}` siempre, nunca `{%- include -%}`** (prohibido por Theme Check).
2. **Todo texto visible → claves de traducción `| t` + locales.** Excepción: secciones creadas desde
   cero no se conectan a traducción automática — ingresar el texto manualmente (ver Schema).
3. **Snippets con `{%- doc -%}`; sections/blocks con `{%- schema -%}` válido.**
4. **Todos los tags y outputs Liquid con whitespace trimming** (`{%-` / `-%}` / `{{-` / `-}}`).
5. **Iniciar sections, snippets y cada `{%- for -%}` con un bloque `{%- liquid -%}`** que asigne todas
   las variables usadas debajo.
6. **Cargar bundles `zrc` vía `asset_url`** — no duplicar en `{% stylesheet %}` lo que ya está en el bundle.
7. **Imágenes**: `<picture>` responsivo; LCP optimizado (`fetchpriority="high"` si `section.index == 1` y
   `forloop.index == 1`), si no `loading="lazy"`; `alt` desde `.alt`. Detalle → [performance-seo-a11y.md](performance-seo-a11y.md).
8. **SEO**: jerarquía de encabezado dinámica (`<h1>` si `section.index == 1`, si no `<h2>`),
   structured data, canonical/meta en layout.
9. **A11y**: HTML semántico, labels, alt, soporte de teclado.

## Sintaxis

| Delimitador | Uso |
|-------------|-----|
| `{{ }}` | Output |
| `{% %}` | Logic tags |

### Whitespace control (obligatorio)

**Cada** tag y output debe trimmar whitespace con `-`. Sin tags `{%` o `{{` sin trim en código committed.

| Forma | Ejemplo |
|-------|---------|
| Logic (ambos lados) | `{%- for block in section.blocks -%}` |
| Logic (solo apertura) | `{%- if condition %}` |
| Logic (solo cierre) | `{% endif -%}` |
| Output (ambos lados) | `{{- product.title -}}` |
| Bloque multi-línea | `{%- liquid … -%}` |

### Reglas

- **Sin paréntesis** en condiciones — anidar `{% if %}` en su lugar.
- **Sin ternario** — siempre `{% if %}…{% else %}…{% endif %}`.
- `contains` funciona solo en strings.
- `for` máx. **50** items por loop — usar `{% paginate %}` para sets más grandes.
- `render` = scope aislado — pasar todas las variables necesarias como parámetros.

## Declaración de variables

Al **inicio** de cada section, snippet e iteración `{% for %}`, abrir bloque `{% liquid %}` que asigne
**todas** las variables usadas abajo. Preferir `{% liquid %}` para lógica multi-paso sobre cadenas
largas de tags.

| Contexto | Fuente | Dónde |
|----------|--------|-------|
| **Section** | `section.settings.*`, `section.id`, etc. | Primeras líneas, antes del markup y assets |
| **Snippet** | Parámetros pasados a `{% render %}` | Primeras líneas tras `{% doc %}`, antes del HTML |
| **For loop** | Loop item (`block`, `product`, …) | Primeras líneas dentro de `{% for %}`, antes del markup |

```liquid
{%- liquid
  assign featured = collection.products | where: 'available', true
  assign count = featured | size
-%}
```

## Patrón de sección

```liquid
{{ 'css-featured-collection.css' | asset_url | stylesheet_tag }}

{%- liquid
  assign section_id = section.id
  assign heading = section.settings.heading
-%}

<section class="featured-collection" {{- section.shopify_attributes -}}>
  {%- for block in section.blocks -%}
    {%- liquid
      assign block_type = block.type
      assign block_text = block.settings.text
    -%}

    {%- case block_type -%}
      {%- when 'heading' -%}
        <div {{- block.shopify_attributes -}}>
          {%- render 'heading', text: block_text -%}
        </div>
    {%- endcase -%}
  {%- endfor -%}
</section>

<script src="{{ 'js-featured-collection.js' | asset_url }}" defer></script>

{%- schema -%}
{
  "name": "t:sections.featured_collection.name",
  "blocks": [{ "type": "heading", "name": "t:blocks.heading.name", "settings": [] }],
  "presets": [{ "name": "t:sections.featured_collection.name" }]
}
{%- endschema -%}
```

- Colocar el `stylesheet_tag` y el `<script … defer>` del bundle de sección al inicio, justo antes de
  abrir la etiqueta del componente/sección.
- `{%- liquid -%}` al inicio asigna `section.settings`; dentro de cada `{%- for -%}`, otro `{%- liquid -%}`
  asigna las variables del loop item.
- `{{- section.shopify_attributes -}}` / `{{- block.shopify_attributes -}}` en wrappers del editor.
- Encapsular la sección en un Web Component personalizado (ej. `<categories-section class="categories">`);
  los custom-element tags deben coincidir con los definidos en el JS de la sección.
- Settings del schema con claves `t:` → definir en locales (salvo secciones desde cero, ver Schema).

## Patrón de snippet

```liquid
{%- doc -%}
  @param {string} text - Heading copy
  @example
  {%- render 'heading', text: block_text -%}
{%- enddoc -%}

{%- liquid
  assign text = text
-%}

<h2 class="heading">{{- text | escape -}}</h2>
```

Pasar data via `{%- render -%}`, luego asignar parámetros en `{%- liquid -%}` antes del markup. Escapar
output de usuario con `| escape`.

## Schema

- JSON válido dentro de `{%- schema -%}` … `{%- endschema -%}`. Settings con `id`, `type`, `label`.
  Presets para que la sección aparezca en el editor.
- **Secciones desde cero (sin traducción automática):**
  - Campos de texto visibles del editor (`name`, `label`, `content`) en texto plano directo (ej. español),
    sin claves `t:`.
  - Declarar `"tag": "section"` y `"class": "{nombre-seccion}-section"` (kebab-case) en la raíz.
  - Agrupar settings con objetos `"type": "header"` (ej. "Botón", "Contenido").
  - En `"presets"`, incluir siempre `"name"` y `"category"`.

## Traducciones

```liquid
{{- 'sections.featured_collection.title' | t -}}
```

Toda cadena visible al usuario usa `| t`. Añadir claves en `locales/en.default.json` (y otros locales si
aplica). Excepción: secciones desde cero → texto manual en el schema (ver arriba).

## Enlaces y atributos

- **Enlaces externos (`_blank`)**: para settings de tipo `url`, capturar dinámicamente si la URL contiene
  `'http'` con `{%- capture … -%}` para inyectar `target="_blank"` de forma segura en los `<a>`.

## CSS dinámico desde settings

Bloques `<style>` con variables CSS derivadas de `section.settings` — válido para valores dinámicos que
no pertenecen al bundle estático:

```liquid
<style>
  #shopify-section-{{ section.id }} .product-list {
    --product-list-items-per-row: {{ section.settings.products_per_row_mobile | times: 1 }};
  }
</style>
```

No duplicar en `<style>` lo que ya está en el bundle `zrc/` salvo que dependa de settings del merchant.

## Snippets compartidos del theme base

El theme incluye snippets reutilizables (`button`, `price-list`, `icon`, `product-info`, etc.). Preferir
`{%- render -%}` de snippets existentes antes de duplicar markup.

## Checklist pre-entrega

- [ ] Todos los tags Liquid con whitespace trimming (`{%-` / `-%}`).
- [ ] `{%- schema -%}` JSON válido; claves de traducción existen en locales.
- [ ] HTML semántico + labels/alt/focus accesibles.
- [ ] Imágenes según [performance-seo-a11y.md](performance-seo-a11y.md); `alt` desde `.alt`.
- [ ] Bundles de sección referenciados coinciden con nombres de output de `zrc`.
- [ ] Theme Check pasa (extensión VS Code o CLI).
