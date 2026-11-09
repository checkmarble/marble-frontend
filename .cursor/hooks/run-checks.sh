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
CHANGED=$(printf '%s\n%s\n%s\n' "$MODIFIED" "$STAGED" "$UNTRACKED" | grep -v '^$' | sort -u || true)

if [ -z "$CHANGED" ]; then
  echo '{}'
  exit 0
fi

TS_FILES=$(printf '%s\n' "$CHANGED" | grep -E '\.(ts|tsx)$' || true)
while IFS= read -r file; do
  if [ -n "$file" ] && [ -f "$file" ]; then
    "$PROJECT_DIR/node_modules/.bin/biome" format --write "$file" >/dev/null 2>&1 || true
  fi
done <<<"$TS_FILES"

ERRORS=""

# Type-check every changed package that defines a type-check script. Any changed file counts
# (locale JSON, tsconfig.json and package.json changes can break type-check too).
PACKAGES=$(printf '%s\n' "$CHANGED" | sed -n 's#^packages/\([^/]*\)/.*#\1#p' | sort -u)
for pkg in $PACKAGES; do
  PKG_DIR="$PROJECT_DIR/packages/$pkg"
  jq -e '.scripts["type-check"]' "$PKG_DIR/package.json" >/dev/null 2>&1 || continue
  RESULT=$(cd "$PKG_DIR" && bun run type-check 2>&1) || {
    PKG_ERRORS=$(printf '%s\n' "$RESULT" | awk 'NR <= 50')
    ERRORS="${ERRORS}

${pkg} type-check errors:
${PKG_ERRORS}"
  }
done

if [ -n "$ERRORS" ]; then
  jq -n \
    --arg message "Type-check failed. Fix these errors before finishing:${ERRORS}" \
    '{followup_message: $message}'
  exit 0
fi

echo '{}'
