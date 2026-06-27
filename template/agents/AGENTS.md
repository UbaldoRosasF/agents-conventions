# Project Rules & Guidelines for AI Agents

Welcome, Agent! This repository is a customized Shopify Theme built using the **getmore-workflow** bundler system. Please adhere to the following rules to ensure compatibility and avoid overwriting compiled assets.

---

## 🛑 Critical Restrictions

1. **Do NOT Edit `/assets` Directly**
   * Never modify compiled CSS (`css-*.css`) or JS (`js-*.js`) files inside the `assets/` directory.
   * These files are automatically compiled and overwritten by `builder.mjs` from the `/zrc` source directory.
   * Modifying them directly will cause edits to be permanently lost on the next build.

2. **Package Manager & Commands**
   * **🛑 NEVER run any `bun` commands** (such as `bun run dev`, `bun run build`, `bun run deploy`, `bun run pull`, `bun install`, etc.) on the user's terminal under any circumstances.
   * The user is running these development commands and processes in a separate terminal. Running them here will cause conflicts.
   * If any dependencies need to be installed or updated, ask the user to perform the action.


---

## 🛠️ Folder Structure & Bundling Logic

All source code for assets resides in the `/zrc` directory.

### 1. Source Styles (`zrc/styles/`)
* **Entry Points (`index.css`)**: Any stylesheet named exactly `index.css` inside `zrc/styles/` will be treated as an entry point. The bundler compiles it and outputs a standalone file in `/assets/` named `css-[path-to-file].css`.
  * *Example*: `/zrc/styles/sections/product/main/index.css` -> `/assets/css-product-main.css`.
* **Partials (`_index.css` or generic names)**: Files starting with an underscore (like `_index.css`) or other named CSS files (e.g., `main.css`) are *partials*. They must be imported into an `index.css` file using `@import './filename';`. They do not compile into standalone assets.
  * *Example*: `/zrc/styles/sections/hot-spots/_index.css` is imported in `/zrc/styles/theme/index.css` (which generates `/assets/css-theme.css`).

### 2. Source Scripts (`zrc/scripts/`)
* **Entry Points (`index.js`)**: Follows the same logic. Any `index.js` file compiles into a standalone `/assets/js-[path-to-file].js`.
* **Partials**: Regular JS files/modules imported into the `index.js` files.

---

## 🎨 Code Style & Quality Standards

Before completing a task, ensure the code adheres to these linting rules:

* **JavaScript**: la fuente única de reglas, lifecycle de Web Components y patrones es
  [javascript/conventions.md](javascript/conventions.md) (autosuficiente). Resumen: StandardJS — sin
  semicolons (`semi: off`), comillas simples, 2 espacios de indentación.
* **CSS**: la fuente única de reglas, tokens y patrones es [css/conventions.md](css/conventions.md)
  (autosuficiente). Resumen: seguir `.stylelintrc`; agrupar media queries o usar PostCSS nesting; evitar
  valores hardcodeados (usar tokens de `zrc/styles/theme/variables/`); nunca borrar ni renombrar custom
  properties existentes — cambiar su valor.

---

## 📚 On-demand documentation

Base conventions are always relevant — una por área, todas autosuficientes: CSS → `css/conventions.md`,
JS → `javascript/conventions.md`, Liquid → `liquid/conventions.md`. Reference and occasional docs —
`css/architecture.md`, `css/postcss.md`, `css/stylelint.md`, `javascript/architecture.md`,
`javascript/eslint.md`, `liquid/architecture.md`, `liquid/theme-check.md`,
`liquid/performance-seo-a11y.md`, and `workflows/style-app-from-figma.md` — are **not** preloaded. Read them
on demand per the **"Cargar bajo demanda"** table in [README.md](README.md), which lists each doc and when
to load it.
