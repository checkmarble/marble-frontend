#!/bin/bash
# Stop hook: format modified files with Biome + run type-check
# If type-check fails, blocks the agent from stopping so it can fix errors.

set -euo pipefail

INPUT=$(cat)

if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  PROJECT_DIR="$CLAUDE_PROJECT_DIR"
else
  CWD=$(printf '%s' "$INPUT" | jq -r '.cwd // empty')
  PROJECT_DIR=$(git -C "${CWD:-.}" rev-parse --show-toplevel 2>/dev/null || true)
  if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="${CWD:-$(pwd)}"
  fi
fi

cd "$PROJECT_DIR"

# Prevent infinite loop: if we already blocked once, let the agent stop
if [ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // .stopHookActive')" = "true" ]; then
  exit 0
fi

# Find modified TS/TSX files (staged + unstaged)
MODIFIED=$(git diff --name-only 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
STAGED=$(git diff --cached --name-only 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
ALL_MODIFIED=$(echo -e "${MODIFIED}\n${STAGED}" | sort -u | grep -v '^$' || true)

# Nothing modified, let the agent stop
if [ -z "$ALL_MODIFIED" ]; then
  exit 0
fi

# Run Biome format on all modified files (silently fix formatting)
for file in $ALL_MODIFIED; do
  if [ -f "$file" ]; then
    "$PROJECT_DIR"/node_modules/.bin/biome format --write "$file" 2>/dev/null || true
  fi
done

# Determine which packages need type-checking
CHECK_APP=false
CHECK_UI=false

for file in $ALL_MODIFIED; do
  case "$file" in
    packages/app-builder/*) CHECK_APP=true ;;
    packages/ui-design-system/*) CHECK_UI=true ;;
  esac
done

ERRORS=""

if [ "$CHECK_APP" = true ]; then
  APP_RESULT=$(cd "$PROJECT_DIR/packages/app-builder" && bun run type-check 2>&1) || {
    ERRORS="$ERRORS\n\n## app-builder type-check errors:\n$(echo "$APP_RESULT" | head -50)"
  }
fi

if [ "$CHECK_UI" = true ]; then
  UI_RESULT=$(cd "$PROJECT_DIR/packages/ui-design-system" && bun run type-check 2>&1) || {
    ERRORS="$ERRORS\n\n## ui-design-system type-check errors:\n$(echo "$UI_RESULT" | head -50)"
  }
fi

# If type-check failed, block the agent from stopping and show errors
if [ -n "$ERRORS" ]; then
  REASON=$(echo -e "Type-check failed. Fix these errors before finishing:$ERRORS" | jq -Rs .)
  printf '{"decision":"block","reason":%s}' "$REASON"
  exit 0
fi

# All good, let the agent stop
exit 0
