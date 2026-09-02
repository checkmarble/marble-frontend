#!/bin/bash
# beforeShellExecution hook: block destructive shell commands
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // .tool_input.command // empty')

deny() {
  jq -n \
    --arg message "$1" \
    '{
      permission: "deny",
      user_message: $message,
      agent_message: "Use a non-destructive alternative."
    }'
  exit 0
}

if [ -z "$COMMAND" ]; then
  echo '{"permission":"allow"}'
  exit 0
fi

# Flatten shell syntax that would otherwise hide a match from the line-oriented patterns below:
# backslash-newline continuations become a single line, and quoted arguments lose their quote
# characters with inner whitespace turned into `_` so each argument stays one token.
# Backslash-escaped quotes inside quoted strings are not tracked.
NORMALIZED=$(printf '%s\n' "$COMMAND" |
  awk '{ if (sub(/\\$/, "")) printf "%s ", $0; else print }' |
  awk '
    BEGIN { SQ = sprintf("%c", 39); DQ = sprintf("%c", 34) }
    {
      out = ""
      quote = ""
      for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (quote == "") {
          if (c == SQ || c == DQ) quote = c
          else out = out c
        } else if (c == quote) {
          quote = ""
        } else {
          out = out ((c == " " || c == "\t") ? "_" : c)
        }
      }
      print out
    }
  ')

# Matches `git` plus any global options before the subcommand, so `git -C <path> reset` is
# caught the same way as `git reset`.
GIT='git[[:space:]]+(-[^[:space:]]*[[:space:]]+([^-[:space:]][^[:space:]]*[[:space:]]+)?)*'

if echo "$NORMALIZED" | grep -qE "${GIT}push.*--force([=[:space:]]|$)|${GIT}push([^;&|]*[[:space:]])-f([[:space:]]|$)"; then
  deny "Blocked git force-push. Use --force-with-lease when appropriate."
fi

if echo "$NORMALIZED" | grep -qE "${GIT}reset[[:space:]]+--hard"; then
  deny "Blocked git reset --hard because it can destroy work."
fi

if echo "$NORMALIZED" | grep -qE "${GIT}clean[[:space:]]+-[^[:space:]]*f"; then
  deny "Blocked git clean with the force flag because it deletes untracked files."
fi

if echo "$NORMALIZED" | grep -qE "${GIT}checkout[[:space:]]+\.[[:space:]]*$"; then
  deny "Blocked git checkout . because it discards unstaged changes."
fi

if echo "$NORMALIZED" | grep -qE 'rm[[:space:]]+-rf[[:space:]]+(/|\*|\.[[:space:]]*$)'; then
  deny "Blocked destructive rm -rf command."
fi

echo '{"permission":"allow"}'
