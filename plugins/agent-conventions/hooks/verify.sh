#!/usr/bin/env bash
# PostToolUse (Edit|Write): verifica SOLO el archivo editado contra el linter que aplique.
# Token-óptimo: solo emite additionalContext cuando hay violaciones.
# Self-gated: no hace nada salvo que sea un theme Shopify con carpeta zrc/.

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
ROOT=$(printf '%s' "$INPUT" | jq -r '.cwd // empty')
[ -z "$ROOT" ] && ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"

# Sin archivo → nada que hacer.
[ -z "$FILE" ] && exit 0

# --- Gate de contexto: Shopify theme + zrc/ ---
[ -d "$ROOT/zrc" ] || exit 0
{ [ -f "$ROOT/shopify.theme.toml" ] || [ -f "$ROOT/config/settings_schema.json" ]; } || exit 0

LINT=""
case "$FILE" in
  */zrc/styles/*.css)
    LINT=$(cd "$ROOT" && bunx stylelint "$FILE" 2>&1 || true)
    ;;
  */zrc/scripts/*.js)
    LINT=$(cd "$ROOT" && bunx eslint "$FILE" 2>&1 || true)
    ;;
  *.liquid)
    REL="${FILE#"$ROOT"/}"
    LINT=$(cd "$ROOT" && shopify theme check --output json 2>/dev/null \
      | jq -r --arg f "$REL" '
          (if type=="array" then . else (.offenses // []) end)
          | map(select((.path // "") | endswith($f)))
          | map(.offenses[]? | "\(.check) [L\(.start_row)] \(.message)")
          | .[]
        ' 2>/dev/null || true)
    ;;
esac

# Solo inyectar contexto si hay findings.
if [ -n "$LINT" ]; then
  printf '%s' "$LINT" | jq -Rs '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":("⚠️ Verificación del archivo editado — corrige antes de continuar:\n" + .)}}'
fi
exit 0
