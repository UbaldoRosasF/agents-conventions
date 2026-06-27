# Arquitectura Liquid (orientación del theme)

Referencia para orientarse en la estructura del theme. Los patrones de autoría (sección, snippet),
sintaxis y reglas viven en [conventions.md](conventions.md).

## Carpetas del theme

```
.
├── assets/          CSS/JS compilado desde zrc/ + imágenes/fuentes estáticas
├── blocks/          theme blocks anidables ({% schema %})
├── config/          settings_schema.json, settings_data.json
├── layout/          theme.liquid, {{ content_for_header }}, {{ content_for_layout }}
├── locales/         en.default.json, etc.
├── sections/        módulos full-width + {% schema %}
├── snippets/        {% render 'name', param: value %}
├── templates/       JSON o .liquid de páginas
└── zrc/             fuentes CSS/JS (workflow Getmore — no nativo de Shopify)
```

**Metodología:** los merchants componen páginas en el theme editor (sections/blocks). Los developers
construyen snippets reutilizables y módulos de sección con settings en schema.

## Roles de archivo

| Tipo | Propósito | Schema | Editor |
|------|-----------|--------|--------|
| **Section** | Módulo full-width | `{%- schema -%}` requerido | Drag blocks, settings sidebar |
| **Block** | Anidado en section/block | `{%- schema -%}` requerido | Configurable por merchant |
| **Snippet** | Partial compartido | Sin schema | API developer-only via params |
| **Template** | Estructura de página (JSON) | N/A | Define orden de sections |
| **Layout** | Shell HTML | N/A | Envuelve todos los templates |

## Integración workflow Getmore

| Capa | Ubicación | Carga en Liquid via |
|------|-----------|---------------------|
| CSS de sección | `zrc/styles/sections/{g}/{n}/index.css` | `{{ 'css-{n}.css' | asset_url | stylesheet_tag }}` |
| JS de sección | `zrc/scripts/sections/{g}/{n}/index.js` | `<script src="{{ 'js-{n}.js' | asset_url }}" defer></script>` |
| CSS global | `zrc/styles/theme/index.css` | `css-theme.css` en layout |
| JS global | `zrc/scripts/theme/index.js` | `<script src="{{ 'js-theme.js' | asset_url }}" defer></script>` en layout |

No duplicar estilos de sección en `{% stylesheet %}` cuando pertenecen al pipeline `zrc/`. Reservar
`{% stylesheet %}`/`{% javascript %}` para código mínimo local que no use `zrc` (común para CSS dinámico
desde settings). Los custom elements en JS deben coincidir con los tags usados en el Liquid de la sección.

## Templates

- Preferir **JSON templates** listando sections para Online Store 2.0.
- Objetos page-specific (`product`, `collection`, etc.) disponibles solo en templates correspondientes.
