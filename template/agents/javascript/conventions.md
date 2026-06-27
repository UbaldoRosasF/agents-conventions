# Convenciones JS

Fuente única de las reglas de JavaScript del theme (bundles ESBuild, ES modules, Web Components,
StandardJS). Cualquier agente debe poder aplicar estas reglas leyendo solo este archivo.

- Reglas de lint / overrides de Standard → [eslint.md](eslint.md).
- Bundling, naming de output y toolchain de `builder.mjs` → [architecture.md](architecture.md).

## Reglas críticas

1. **No editar `assets/js-*.js`** — son output generado. Editar solo en `zrc/scripts/`.
2. **Un `index.js` por bundle**, como raíz de composición delgada (solo imports + registro).
3. **Web Components** con cleanup completo en `disconnectedCallback`.
4. **Un módulo, una responsabilidad**; utilidades → named exports.
5. **jQuery**: capturar `window.jQuery` a nivel de módulo si hace falta (no `import 'jquery'`).
6. **StandardJS** — sin punto y coma forzado.
7. **Carruseles desde cero**: usar **Swiper** de forma obligatoria (analizar su uso en otros JS de `zrc/`).

## Dónde van los archivos

```
zrc/scripts/
├── theme/index.js             → bundle global (js-theme.js); commons/index.js → utilidades compartidas
├── components/                → módulos importados por theme u otros bundles
├── sections/{group}/{name}/
│   ├── index.js               ← entry del bundle (imports + registro)
│   └── *.js                   ← módulos (importados, no bundles standalone)
├── templates/{name}/index.js  ← bundle scoped a template
└── apps/                      ← wrappers de apps de terceros
```

Solo `index.js` emite un asset; el resto son módulos que se `import`an. Dividir la lógica en módulos y
mantener `index.js` delgado.

### Rol del entry file (raíz de composición)

```js
import ProductCarousel from './carousel'
import ProductCarouselZoom from './zoom'

window.customElements.define('product-carousel', ProductCarousel)
window.customElements.define('product-carousel-zoom', ProductCarouselZoom)
```

- Default imports → clases a registrar o instanciar.
- Side-effect imports (`import './file'`) → módulos que se auto-registran.
- El registro ocurre aquí, no disperso en módulos de feature (salvo módulo intencionalmente autocontenido).
- Los custom-element tags del markup Liquid deben coincidir con los nombres definidos aquí.

## Tipos de módulo

| Tipo | Export | Registrado en | Propósito |
|------|--------|---------------|-----------|
| Entry | — | — | `index.js` — imports + `customElements.define` |
| Component | `export default class` | `index.js` | Web Component (subclase de `HTMLElement`) |
| Controller | `export default class` | importado por component | Helper no-DOM |
| Utility | `export function` / `export const` | importado donde haga falta | Helpers puros |
| Side-effect | none | `import './file'` | Auto-registra element o parchea jQuery |

## Web Components (patrón principal)

```js
export default class MySection extends window.HTMLElement {
  connectedCallback () {
    if (this._initialized) return
    if (this.ownerDocument !== document) return

    this.$root = this.querySelector('.my-section-root')
    if (this.$root === null) return

    this.bindEvents()
    this._initialized = true
  }

  disconnectedCallback () {
    window.removeEventListener('resize', this._onResize)
    this.plugin?.destroy?.()
    this._observer?.disconnect()
    this._initialized = false
  }

  bindEvents () {
    this._onResize = () => { /* … */ }
    window.addEventListener('resize', this._onResize, { passive: true })
  }
}
```

### Reglas de lifecycle

| Concern | Patrón |
|---------|--------|
| Double init | flag `this._initialized`; `true` tras setup, `false` en disconnect |
| Theme editor | Skip cuando `this.ownerDocument !== document` |
| DOM faltante | Early return si nodos requeridos son `null` |
| Cleanup | Todo listener, observer, timer e instancia de plugin de `connectedCallback` debe revertirse en `disconnectedCallback` |
| Handlers | Guardar en `this._onEventName` para poder remover |

### Registro

- Definir en el `index.js` del bundle: `window.customElements.define('my-section', MySection)`.
- Tag names: **kebab-case**, alineados con el markup Liquid.
- Evitar definir el mismo tag en múltiples bundles.

## jQuery (opcional, provisto por theme)

El theme carga jQuery vía Liquid — no via `import 'jquery'` en código de sección.

```js
const $jq = typeof window !== 'undefined' ? window.jQuery : undefined
```

**Por qué captura a nivel de módulo:** los plugins (Slick, etc.) se adjuntan a la instancia de jQuery
presente al cargar; una lectura fresca de `window.jQuery` puede perder plugins.

**Con plugins jQuery:** guard `$jq?.fn?.pluginName` antes de llamar; destroy en `disconnectedCallback`
(ej. `.slick('unslick')`); no `import 'jquery'` desde `node_modules`.

## matchMedia y resize

Usar `matchMedia` para lógica condicional por viewport; guardar refs para cleanup en `disconnectedCallback`.

## Carruseles y Sliders (Swiper)

- **Swiper obligatorio** al construir un carrusel/slider desde cero.
- **Destrucción**: `this.swiper?.destroy()` en `disconnectedCallback`.
- **Referencia**: analizar la implementación en otros JS de `zrc/` para alinear configuración,
  inicialización e integración de navegación.

## Dependencias npm

Disponibles vía import ESM: `swiper`, `photoswipe`, `jquery` (como dep npm, pero preferir `window.jQuery`
en código de sección), etc. Ver `package.json`.

## Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Class | PascalCase | `ProductCarousel` |
| Constant | SCREAMING_SNAKE | `CAROUSEL_DESKTOP_MIN_WIDTH_QUERY` |
| Method / property | camelCase | `initMainCarousel` |
| Private / internal | `_` prefix | `_desktopMediaQuery` |
| DOM node variable | `$` prefix | `$video`, `$slide` |

## ESLint en archivos legacy

Algunos entry files tienen `/* eslint-disable */` al inicio — no extender ese patrón a código nuevo
salvo justificación explícita. Detalle de reglas → [eslint.md](eslint.md).

## Checklist pre-entrega

- [ ] ESLint limpio (StandardJS).
- [ ] Nuevos components registrados en el `index.js` de su bundle.
- [ ] Listeners, observers, timers e instancias de plugins limpiados en `disconnectedCallback`.
- [ ] Nodos DOM requeridos validados antes de init (early return).

> No correr `bun run build` / `bun run dev` — el usuario mantiene el watch en otra terminal.
