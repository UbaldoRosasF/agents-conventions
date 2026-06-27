# agent-conventions

Convenciones de IA (CSS / JavaScript / Liquid) para themes Shopify con el **workflow Getmore**, listas
para instalar en cualquier proyecto y que **Claude y cualquier agente** las lean y las verifiquen en
cada edición.

Dos capas:

1. **Archivos en el repo** (cualquier agente) — `.agents/` + `CLAUDE.md` + `AGENTS.md`, vía instalador.
2. **Plugin de Claude Code** (verificación viva) — hook `PostToolUse` que lintea el archivo editado.

---

## Instalar en un proyecto

Desde la raíz del proyecto Shopify:

```bash
bunx github:<user>/agent-conventions init
```

Esto deja commiteable:
- `.agents/` (las convenciones — fuente de verdad)
- `CLAUDE.md` (entry de Claude, con `@imports`)
- `AGENTS.md` (entry cross-agent + regla de verificación por acción)

Es **idempotente**: re-ejecutarlo actualiza `.agents/` y respeta el resto de tus archivos (el bloque
gestionado va entre marcadores `agent-conventions:start/end`).

**No** toca `.stylelintrc`, `.theme-check.yml`, `postcss.config.js` ni `eslintConfig` — esos vienen del
workflow Getmore.

Flag opcional `--with-hook`: además escribe el hook de verificación en `.claude/settings.json` (solo si
**no** vas a usar el plugin; con el plugin instalado es innecesario y duplicaría el disparo).

## Verificación viva en Claude (una vez por máquina)

```text
/plugin marketplace add <user>/agent-conventions
/plugin install agent-conventions@agent-conventions
```

El hook corre **solo** en themes Shopify con carpeta `zrc/` (detecta `shopify.theme.toml` o
`config/settings_schema.json`). En cualquier otro proyecto sale silencioso — cero ruido, cero tokens.
Lintea únicamente el archivo editado y solo devuelve contexto cuando hay una violación.

| Archivo editado | Verificación |
|-----------------|--------------|
| `zrc/styles/**/*.css` | `stylelint` |
| `zrc/scripts/**/*.js` | `eslint` |
| `**/*.liquid` | `shopify theme check` (filtrado al archivo) |

## Estructura

```
agent-conventions/
├── package.json                 bin → instalador
├── bin/install.mjs              instalador idempotente (sin deps)
├── template/agents/             las convenciones (→ .agents/)
├── .claude-plugin/
│   └── marketplace.json         marketplace
└── plugins/agent-conventions/
    ├── .claude-plugin/plugin.json
    └── hooks/
        ├── hooks.json
        └── verify.sh            hook self-gated, token-óptimo
```

## Actualizar las convenciones

Edita `template/agents/**` aquí, haz push, y en cada proyecto vuelve a correr
`bunx github:<user>/agent-conventions init`. El plugin se actualiza desde Claude con
`/plugin marketplace update agent-conventions`.
