#!/bin/bash
# Stop hook: format modified files with Biome + run type-check
# If type-check fails, blocks Claude from stopping so it can fix errors.

set -euo pipefail

INPUT=$(cat)

# Prevent infinite loop: if we already blocked once, let Claude stop
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Find modified TS/TSX files (staged + unstaged)
MODIFIED=$(git diff --name-only 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
STAGED=$(git diff --cached --name-only 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
ALL_MODIFIED=$(echo -e "${MODIFIED}\n${STAGED}" | sort -u | grep -v '^$' || true)

# Nothing modified, let Claude stop
if [ -z "$ALL_MODIFIED" ]; then
  exit 0
fi

# Run Biome format on all modified files (silently fix formatting)
for file in $ALL_MODIFIED; do
  if [ -f "$file" ]; then
    "$CLAUDE_PROJECT_DIR"/node_modules/.bin/biome format --write "$file" 2>/dev/null || true
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
  APP_RESULT=$(cd "$CLAUDE_PROJECT_DIR/packages/app-builder" && bun run type-check 2>&1) || {
    ERRORS="$ERRORS\n\n## app-builder type-check errors:\n$(echo "$APP_RESULT" | head -50)"
  }
fi

if [ "$CHECK_UI" = true ]; then
  UI_RESULT=$(cd "$CLAUDE_PROJECT_DIR/packages/ui-design-system" && bun run type-check 2>&1) || {
    ERRORS="$ERRORS\n\n## ui-design-system type-check errors:\n$(echo "$UI_RESULT" | head -50)"
  }
fi

# If type-check failed, block Claude from stopping and show errors
if [ -n "$ERRORS" ]; then
  REASON=$(echo -e "Type-check failed. Fix these errors before finishing:$ERRORS" | jq -Rs .)
  printf '{"decision":"block","reason":%s}' "$REASON"
  exit 0
fi

# All good, let Claude stop
exit 0
