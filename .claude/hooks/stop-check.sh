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

# Changed files (staged + unstaged + new untracked)
CHANGED=$({ git diff --name-only; git diff --cached --name-only; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u | grep -v '^$' || true)

# Nothing changed, let the agent stop
if [ -z "$CHANGED" ]; then
  exit 0
fi

# Format and apply assist (including named-import sort) so the result matches `biome check`.
TS_FILES=$(echo "$CHANGED" | grep -E '\.(ts|tsx)$' || true)
for file in $TS_FILES; do
  if [ -f "$file" ]; then
    "$PROJECT_DIR"/node_modules/.bin/biome check --write --linter-enabled=false "$file" >/dev/null 2>&1 || true
  fi
done

ERRORS=""

# Desktop hook environments may omit Bun's install directory from PATH.
BUN_COMMAND=$(command -v bun || true)
if [ -z "$BUN_COMMAND" ]; then
  BUN_COMMAND="${BUN_INSTALL:-$HOME/.bun}/bin/bun"
fi

# Type-check every changed package that defines a type-check script. Any changed file counts
# (locale JSON, tsconfig.json and package.json changes can break type-check too).
PACKAGES=$(echo "$CHANGED" | sed -n 's#^packages/\([^/]*\)/.*#\1#p' | sort -u)
for pkg in $PACKAGES; do
  PKG_DIR="$PROJECT_DIR/packages/$pkg"
  jq -e '.scripts["type-check"]' "$PKG_DIR/package.json" >/dev/null 2>&1 || continue
  RESULT=$(cd "$PKG_DIR" && "$BUN_COMMAND" run type-check 2>&1) || {
    ERRORS="$ERRORS\n\n## $pkg type-check errors:\n$(echo "$RESULT" | head -50)"
  }
done

# If type-check failed, block the agent from stopping and show errors
if [ -n "$ERRORS" ]; then
  REASON=$(echo -e "Type-check failed. Fix these errors before finishing:$ERRORS" | jq -Rs .)
  printf '{"decision":"block","reason":%s}' "$REASON"
  exit 0
fi

# All good, let the agent stop
exit 0
