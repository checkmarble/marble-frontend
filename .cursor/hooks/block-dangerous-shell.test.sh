#!/bin/bash
# Regression cases for block-dangerous-shell.sh. Run: .cursor/hooks/block-dangerous-shell.test.sh
set -uo pipefail

HOOK="$(dirname "$0")/block-dangerous-shell.sh"
FAILURES=0

check() {
  local expected=$1 command=$2
  local actual
  actual=$(jq -Rn --arg c "$command" '{command:$c}' | "$HOOK" | jq -r '.permission')
  if [ "$actual" = "$expected" ]; then
    printf 'ok    %-6s %s\n' "$expected" "${command//$'\n'/\\n}"
  else
    printf 'FAIL  want %-6s got %-6s %s\n' "$expected" "$actual" "${command//$'\n'/\\n}"
    FAILURES=$((FAILURES + 1))
  fi
}

# Force-push, including quoted global-option values and backslash-newline continuations.
check deny 'git push --force origin main'
check deny 'git push -f origin main'
check deny 'git push "--force" origin main'
check deny 'git -C "/my repo" push --force origin main'
check deny 'git -C "/my repo" push -f origin main'
check deny 'git push \
  --force origin main'
check deny 'git push \
  -f origin main'
check deny 'git \
  push --force origin main'

# Other destructive git forms, bare and behind global options.
check deny 'git reset --hard HEAD'
check deny 'git -C /tmp/repo reset --hard HEAD'
check deny 'git -C "/my repo" reset --hard HEAD'
check deny 'git clean -fd'
check deny 'git --no-pager -C "/my repo" clean -fd'
check deny 'git checkout .'
check deny 'git -C "/my repo" checkout .'

check deny 'rm -rf /'
check deny 'rm -rf "/"'

# Non-destructive commands must stay allowed.
check allow 'git push --force-with-lease origin main'
check allow 'git push \
  origin main'
check allow 'git status'
check allow 'git -C "/my repo" status'
check allow 'git -C "/my repo" reset --soft HEAD~1'
check allow 'git -C "/my repo" checkout feature/x'
check allow 'git log --oneline -5'
check allow 'bun run -F app-builder type-check'

if [ "$FAILURES" -gt 0 ]; then
  echo "$FAILURES failing case(s)"
  exit 1
fi
echo 'all cases passed'
