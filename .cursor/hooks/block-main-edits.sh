#!/bin/bash
# preToolUse hook: block file edits on main/master
set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
PROJECT_DIR=${CWD:-${CURSOR_PROJECT_DIR:-$(pwd)}}
BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  jq -n \
    --arg branch "$BRANCH" \
    '{
      permission: "deny",
      user_message: ("Agent edits are blocked on " + $branch + "."),
      agent_message: "Create or switch to a feature branch before editing."
    }'
  exit 0
fi

echo '{"permission":"allow"}'
