#!/bin/bash
# stop hook: format modified TypeScript files and run package type checks
set -euo pipefail

INPUT=$(cat)
LOOP_COUNT=$(echo "$INPUT" | jq -r '.loop_count // 0')
PROJECT_DIR=${CURSOR_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-$(pwd)}}

if [ "$LOOP_COUNT" -ge 3 ]; then
  echo '{}'
  exit 0
fi

cd "$PROJECT_DIR"

MODIFIED=$(git diff --name-only 2>/dev/null || true)
STAGED=$(git diff --cached --name-only 2>/dev/null || true)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || true)
ALL_MODIFIED=$(
  printf '%s\n%s\n%s\n' "$MODIFIED" "$STAGED" "$UNTRACKED" |
    grep -E '\.(ts|tsx)$' |
    sort -u || true
)

if [ -z "$ALL_MODIFIED" ]; then
  echo '{}'
  exit 0
fi

while IFS= read -r file; do
  if [ -f "$file" ]; then
    "$PROJECT_DIR/node_modules/.bin/biome" format --write "$file" >/dev/null 2>&1 || true
  fi
done <<<"$ALL_MODIFIED"

ERRORS=""

if printf '%s\n' "$ALL_MODIFIED" | grep -q '^packages/app-builder/'; then
  APP_RESULT=$(cd "$PROJECT_DIR/packages/app-builder" && bun run type-check 2>&1) || {
    APP_ERRORS=$(printf '%s\n' "$APP_RESULT" | awk 'NR <= 50')
    ERRORS="${ERRORS}

app-builder type-check errors:
${APP_ERRORS}"
  }
fi

if printf '%s\n' "$ALL_MODIFIED" | grep -q '^packages/ui-design-system/'; then
  UI_RESULT=$(cd "$PROJECT_DIR/packages/ui-design-system" && bun run type-check 2>&1) || {
    UI_ERRORS=$(printf '%s\n' "$UI_RESULT" | awk 'NR <= 50')
    ERRORS="${ERRORS}

ui-design-system type-check errors:
${UI_ERRORS}"
  }
fi

if [ -n "$ERRORS" ]; then
  jq -n \
    --arg message "Type-check failed. Fix these errors before finishing:${ERRORS}" \
    '{followup_message: $message}'
  exit 0
fi

echo '{}'
