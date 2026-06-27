# Convenciones CSS

Fuente única de las reglas de estilos del theme (PostCSS + bundles ESBuild, CSS plano con nesting — sin
Sass/Less). Cualquier agente debe poder aplicar estas reglas leyendo solo este archivo.

- Detalle de funciones fluidas (`responsive()`, `bp()`, `formula()`) y plugins → [postcss.md](postcss.md).
- Bundling, entry points y naming de output → [architecture.md](architecture.md).
- Reglas de lint y orden de propiedades → [stylelint.md](stylelint.md).

## Reglas críticas

1. **No editar `assets/css-*.css`** — son output generado. Editar solo en `zrc/styles/`.
2. **Un `index.css` por bundle** (sección/template/área). Componentes compartidos se `@import`an en
   `theme/index.css`; no emiten bundle propio.
3. **`responsive()` → solo tipografía** (`font-size`, `line-height`, `letter-spacing`), **nunca en
   botones**.
4. **`bp()` → tipografía de botones + cualquier otra propiedad numérica** que cambie de valor. El 3er
   parámetro es el breakpoint: determinarlo analizando la sección donde se agrega el estilo.
5. **`:hover` siempre dentro de `@media (hover: hover)`** (evita estados sticky en touch).
6. **Tokens de marca → siempre en `theme/variables/`** y consumidos vía `var()`. Custom properties
   locales permitidas con propósito (ver abajo). **Nunca borrar ni renombrar** una custom property
   existente; si hace falta, cambiar su valor.
7. **Custom elements contenedores** (secciones desde cero): definir `display: block` sobre la etiqueta.

## Dónde van los archivos

```
zrc/styles/
├── theme/index.css            ← entry del bundle global (variables, utils, layout, componentes)
├── components/{name}/         UI compartida (importada por theme/index.css)
├── layout/{name}/             header, footer, announcement-bar
├── sections/{group}/{name}/
│   ├── index.css              ← entry del bundle de sección
│   ├── {name}.css             estilos base (mobile-first)
│   └── responsive.css         @media con overrides en breakpoints
└── templates/{name}/index.css
```

Solo `index.css` emite un asset; el resto son partials que se `@import`an. Patrón de entry file —
base primero, luego responsive:

```css
@import './featured-collection.css';
@import './responsive.css';
```

`responsive.css` contiene bloques `@media` que overridean propiedades en breakpoints (no reglas
completas duplicadas). Todos los `@import` al inicio del archivo: mismo directorio puede omitir
extensión (`'./typography'`), subcarpetas la incluyen (`'./utils/grid-flex.css'`).

## Design tokens (`:root`)

Definir tokens globales en `zrc/styles/theme/variables/`:

```css
/* colors.css */     :root { --primary-color: #060703; --secondary-color: #f2e9de; }
/* fonts.css */      :root { --primary-font: 'Brand Font', sans-serif; }
```

Los componentes consumen tokens vía `var()`. Tipografía: tipo fluido vía `responsive()`. Otras
propiedades numéricas: `bp()`.

### Custom properties

- **Tokens de marca → globales.** Si existe un token global que aplica, usarlo; no recrearlo como
  variable local.
- **Locales → permitidas con propósito.** Caso típico: definir un valor una vez y alternarlo entre
  estados (`:hover`, `:active`, `:focus`) o selectores anidados, evitando duplicar cadenas de
  selectores. Kebab-case con prefijo `--` y nombre descriptivo.
- **Nunca borrar ni renombrar** una existente (global o local); modificar su valor si hace falta.

```css
.section {
  --custom-color: black;

  .icon path { fill: var(--custom-color); }

  @media (hover: hover) {
    &:hover { --custom-color: white; }
  }

  &:active { --custom-color: white; }
}
```

## Scoping de sección

Shopify añade `.shopify-section--{section-name}` al wrapper. Usarlo para aislar estilos:

```css
.shopify-section--featured-collection {
  .product-list { column-gap: bp(12, 16, 699); }
}
```

## Patrón de componente

La clase raíz declara directamente; las variantes overridean:

```css
.btn {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: bp(14, 16);
  padding: bp(12, 24);
}

.btn--secondary { background-color: var(--secondary-color); }
```

## Nesting y media queries

PostCSS nesting nativo con `&`. Preferir sintaxis de rango en media queries cuando aplique
(`@media (width >= 700px)`); mantener consistencia con `@media screen and (min-width: …)` en archivos
legacy que ya lo usen.

```css
.card {
  display: flex;

  @media (hover: hover) {
    &:hover { opacity: 0.8; }
  }
}
```

## Naming

- Clases: **kebab-case**, con prefijo del componente cuando ayude (`product-card`, `featured-collection`).
- Sin BEM estricto salvo variantes simples con `--` (`btn--secondary`).
- Prettier (`.prettierrc`): 2 espacios, comillas simples, sin semicolon forzado, `printWidth: 200`.

## Checklist pre-entrega

- [ ] Stylelint pasa (orden de propiedades, límites de selectores → [stylelint.md](stylelint.md)).
- [ ] Colores/fuentes usan tokens de `theme/variables/`.
- [ ] Componentes compartidos importados en `theme/index.css`; CSS de sección en su propio bundle.
- [ ] `responsive()` solo en tipografía (no botones); `bp()` en botones y demás propiedades numéricas.
- [ ] `:hover` envuelto en `@media (hover: hover)`.

> No correr `bun run build` / `bun run dev` — el usuario mantiene el watch en otra terminal. Pedirle
> que compile solo si hay que depurar un error de build.
