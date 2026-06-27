# ESLint

Config: `package.json` → `eslintConfig`. Extiende **Standard** (`standard` package).

## Environment

```json
{ "browser": true, "jquery": true }
```

## Rule overrides

| Regla | Setting | Efecto |
|-------|---------|--------|
| `semi` | off | Sin punto y coma |
| `quotes` | off | Comillas simples o dobles permitidas |
| `comma-dangle` | off | Trailing commas opcionales |
| `space-before-function-paren` | `0` | `function foo ()` — espacio antes de `()` |
| `no-new` | off | `new SomeClass()` sin asignación permitido |
| `no-whitespace-before-property` | off | Relajado |
| `no-unused-vars` | error | Vars sin usar fallan; `_` solo se ignora |

## Estilo de código

Indent 2 espacios, igualdad estricta (`===` / `!==`), prefijo `window.` en globals (`HTMLElement`,
`fetch`, `Event`, `customElements`), sin imports sin usar. Tipos de módulo y naming →
[conventions.md](conventions.md).

## Ejecutar

```bash
bunx eslint zrc/scripts/
```

O via extensión ESLint en VS Code (ver README del proyecto).

## Formato

No hay Prettier para JS — seguir StandardJS y el estilo del archivo que se edita. CSS usa Prettier por separado (`.prettierrc`).
