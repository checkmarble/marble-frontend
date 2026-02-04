#!/bin/bash
# PreToolUse hook: block file edits on main/master branch
set -euo pipefail

INPUT=$(cat)
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "Blocked: cannot edit files on $BRANCH branch. Create a feature branch first." >&2
  exit 2
fi

exit 0
