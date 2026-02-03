#!/bin/bash
# PreToolUse hook: block dangerous bash commands
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block destructive git commands
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  echo "Blocked: git push --force is not allowed. Use --force-with-lease if needed." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "Blocked: git reset --hard can destroy work. Use git stash or git reset --soft instead." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+clean\s+-f'; then
  echo "Blocked: git clean -f permanently deletes untracked files." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+checkout\s+\.\s*$'; then
  echo "Blocked: git checkout . discards all unstaged changes." >&2
  exit 2
fi

# Block destructive file operations
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+/|rm\s+-rf\s+\*|rm\s+-rf\s+\.\s'; then
  echo "Blocked: destructive rm -rf command." >&2
  exit 2
fi

exit 0
