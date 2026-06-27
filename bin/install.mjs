#!/usr/bin/env node
// Instalador idempotente de las convenciones de agentes en cualquier proyecto.
// Uso: bunx github:<user>/agent-conventions init [--with-hook]
//   init        copia .agents/ y fusiona CLAUDE.md + AGENTS.md (idempotente)
//   --with-hook además escribe el hook de verificación en .claude/settings.json
//               (normalmente innecesario: lo aporta el plugin de Claude Code)

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(__dirname, '..')
const TARGET = process.cwd()
const args = process.argv.slice(2)
const WITH_HOOK = args.includes('--with-hook')

const START = '<!-- agent-conventions:start (gestionado por el instalador — no editar entre marcadores) -->'
const END = '<!-- agent-conventions:end -->'

const CLAUDE_BLOCK = `${START}
@.agents/README.md
@.agents/AGENTS.md

> Docs de referencia/ocasionales no se importan aquí (cargar bajo demanda según la tabla de \`.agents/README.md\`).

## CSS
@.agents/css/conventions.md

## JavaScript
@.agents/javascript/conventions.md

## Liquid
@.agents/liquid/conventions.md
${END}`

const AGENTS_BLOCK = `${START}
# Convenciones del proyecto (cualquier agente de IA)

Este proyecto sigue las convenciones en \`.agents/\`. Antes de modificar código, lee:
- \`.agents/AGENTS.md\` — reglas y restricciones del proyecto.
- \`.agents/css/conventions.md\`, \`.agents/javascript/conventions.md\`, \`.agents/liquid/conventions.md\` — fuente única por área (autosuficientes).
- Docs on-demand según la tabla "Cargar bajo demanda" de \`.agents/README.md\`.

## Verificación obligatoria por acción
Tras crear o editar un archivo, valida **ese** archivo con su linter antes de continuar y corrige lo que falle:
- \`zrc/styles/**/*.css\` → \`bunx stylelint <archivo>\`
- \`zrc/scripts/**/*.js\` → \`bunx eslint <archivo>\`
- \`**/*.liquid\` → \`shopify theme check\`

Nunca ejecutes \`bun run build\` / \`bun run dev\` — el usuario mantiene el watch en otra terminal.
${END}`

const CLAUDE_FRESH = `# Shopify Theme (workflow Getmore)\n\n${CLAUDE_BLOCK}\n`
const AGENTS_FRESH = `${AGENTS_BLOCK}\n`

function upsertManagedBlock (file, block, freshContent) {
  const path = join(TARGET, file)
  if (!existsSync(path)) {
    writeFileSync(path, freshContent)
    return `creado ${file}`
  }
  const current = readFileSync(path, 'utf8')
  const s = current.indexOf(START)
  const e = current.indexOf(END)
  if (s !== -1 && e !== -1 && e > s) {
    const next = current.slice(0, s) + block + current.slice(e + END.length)
    if (next === current) return `${file} sin cambios`
    writeFileSync(path, next)
    return `actualizado bloque en ${file}`
  }
  // Existe pero sin nuestro bloque → anexar al final.
  const sep = current.endsWith('\n') ? '\n' : '\n\n'
  writeFileSync(path, current + sep + block + '\n')
  return `bloque añadido a ${file}`
}

function installHook () {
  const dir = join(TARGET, '.claude')
  const path = join(dir, 'settings.json')
  mkdirSync(dir, { recursive: true })
  let settings = {}
  if (existsSync(path)) {
    try { settings = JSON.parse(readFileSync(path, 'utf8')) } catch { settings = {} }
  }
  settings.hooks ||= {}
  settings.hooks.PostToolUse ||= []
  const already = JSON.stringify(settings.hooks.PostToolUse).includes('agent-conventions-verify')
  if (already) return '.claude/settings.json ya tiene el hook'
  settings.hooks.PostToolUse.push({
    matcher: 'Edit|Write',
    hooks: [{
      type: 'command',
      // marcador 'agent-conventions-verify' para idempotencia; lógica equivalente al plugin
      command: "FILE=$(jq -r '.tool_input.file_path // empty'); ROOT=\"${CLAUDE_PROJECT_DIR:-$PWD}\"; # agent-conventions-verify\n[ -z \"$FILE\" ] && exit 0; [ -d \"$ROOT/zrc\" ] || exit 0; { [ -f \"$ROOT/shopify.theme.toml\" ] || [ -f \"$ROOT/config/settings_schema.json\" ]; } || exit 0; L=\"\"; case \"$FILE\" in */zrc/styles/*.css) L=$(cd \"$ROOT\" && bunx stylelint \"$FILE\" 2>&1 || true);; */zrc/scripts/*.js) L=$(cd \"$ROOT\" && bunx eslint \"$FILE\" 2>&1 || true);; *.liquid) L=$(cd \"$ROOT\" && shopify theme check --output json 2>/dev/null | jq -r --arg f \"${FILE#$ROOT/}\" 'if type==\"array\" then . else (.offenses // []) end | map(select((.path // \"\")|endswith($f))) | map(.offenses[]? | \"\\(.check) [L\\(.start_row)] \\(.message)\") | .[]' || true);; esac; [ -n \"$L\" ] && printf '%s' \"$L\" | jq -Rs '{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":.}}'",
      timeout: 30
    }]
  })
  writeFileSync(path, JSON.stringify(settings, null, 2) + '\n')
  return 'hook escrito en .claude/settings.json'
}

// --- run ---
const log = []
cpSync(join(PKG_ROOT, 'template', 'agents'), join(TARGET, '.agents'), { recursive: true })
log.push('copiado .agents/')
log.push(upsertManagedBlock('CLAUDE.md', CLAUDE_BLOCK, CLAUDE_FRESH))
log.push(upsertManagedBlock('AGENTS.md', AGENTS_BLOCK, AGENTS_FRESH))
if (WITH_HOOK) log.push(installHook())

console.log('\n  agent-conventions instaladas en: ' + TARGET)
for (const l of log) console.log('   • ' + l)
console.log('\n  Siguiente paso (una sola vez por máquina, para la verificación viva en Claude):')
console.log('   /plugin marketplace add <user>/agent-conventions')
console.log('   /plugin install agent-conventions@agent-conventions\n')
