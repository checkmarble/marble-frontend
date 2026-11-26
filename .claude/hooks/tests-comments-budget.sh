#!/bin/bash
# Prints a block reason when unpushed work adds more comment lines or test cases than
# .claude/rules/tests-and-comments.md budgets for, and nothing otherwise. Called by stop-check.sh.
#
# Unpushed work is every commit not on a remote, plus the working tree: the agent's own work,
# committed or not. A list already shown is shown again only once it grows.

set -euo pipefail

# Main has about one comment line per 45 lines of code.
CODE_LINES_PER_COMMENT=40
MIN_COMMENTS=3
MAX_TESTS=8
MAX_LISTED=60

OLDEST=$(git rev-list --reverse HEAD --not --remotes 2>/dev/null | head -1 || true)
if [ -n "$OLDEST" ]; then
  # No parent: the branch shares no history with a remote, so there is no base to compare to.
  BASE=$(git rev-parse --verify --quiet "$OLDEST^") || exit 0
else
  BASE=$(git rev-parse HEAD)
fi

PATHSPEC=('*.ts' '*.tsx' ':!**/generated/**' ':!**/routeTree.gen.ts')

# One "file<TAB>line<TAB>text" row per added line.
ADDED=$(
  {
    git diff -U0 --no-color --no-ext-diff "$BASE" -- "${PATHSPEC[@]}" | awk '
      /^\+\+\+ b\// { file = substr($0, 7); next }
      /^@@/ { match($0, /\+[0-9]+/); line = substr($0, RSTART + 1, RLENGTH - 1); next }
      /^\+/ { print file "\t" line "\t" substr($0, 2); line++ }'
    git ls-files --others --exclude-standard -- "${PATHSPEC[@]}" | while IFS= read -r file; do
      awk -v f="$file" '{ print f "\t" NR "\t" $0 }' "$file"
    done
  } || true
)

[ -z "$ADDED" ] && exit 0

# One "kind<TAB>file:line<TAB>text" row per counted line: c (comment), t (test case) or k (code
# outside spec files). Blank lines, bare comment delimiters and tool directives are not counted.
CLASSIFIED=$(printf '%s\n' "$ADDED" | awk -F'\t' '
  {
    text = $3; for (i = 4; i <= NF; i++) text = text "\t" $i
    if (text ~ /^[ \t]*$/) next
    spec = $1 ~ /\.spec\.tsx?$/
    if (text ~ /^[ \t]*(\/\/|\/\*|\*|\{\/\*)/) {
      if (text ~ /^[ \t]*\{?(\/\*\*?|\*\/)\}?[ \t]*$/) next
      if (text ~ /biome-ignore|@ts-expect-error|@ts-ignore|eslint-disable/) next
      kind = "c"
    } else if (spec && text ~ /^[ \t]*(it|test)(\.[a-z]+)?\(/) {
      kind = "t"
    } else if (spec) {
      next
    } else {
      kind = "k"
    }
    sub(/^[ \t]+/, "", text)
    print kind "\t" $1 ":" $2 "\t" text
  }')

COMMENTS=$(printf '%s\n' "$CLASSIFIED" | grep -c '^c' || true)
TESTS=$(printf '%s\n' "$CLASSIFIED" | grep -c '^t' || true)
CODE=$(printf '%s\n' "$CLASSIFIED" | grep -c '^k' || true)

MAX_COMMENTS=$((CODE / CODE_LINES_PER_COMMENT))
[ "$MAX_COMMENTS" -lt "$MIN_COMMENTS" ] && MAX_COMMENTS=$MIN_COMMENTS

[ "$COMMENTS" -le "$MAX_COMMENTS" ] && [ "$TESTS" -le "$MAX_TESTS" ] && exit 0

STATE="$(git rev-parse --git-dir)/claude-tests-comments-budget"
if [ -f "$STATE" ]; then
  read -r SEEN_BASE SEEN_COMMENTS SEEN_TESTS <"$STATE" || true
  if [ "${SEEN_BASE:-}" = "$BASE" ] && [ "$COMMENTS" -le "${SEEN_COMMENTS:-0}" ] && [ "$TESTS" -le "${SEEN_TESTS:-0}" ]; then
    exit 0
  fi
fi
echo "$BASE $COMMENTS $TESTS" >"$STATE"

list() {
  printf '%s\n' "$CLASSIFIED" | awk -F'\t' -v k="$1" -v max="$MAX_LISTED" '
    $1 == k { n++; if (n <= max) print "- " $2 "  " $3 }
    END { if (n > max) print "- … and " n - max " more" }'
}

echo "Your unpushed work adds $COMMENTS comment lines (budget $MAX_COMMENTS for $CODE lines of code) and $TESTS test cases (budget $MAX_TESTS)."
echo
echo "Audit every item below against .claude/rules/tests-and-comments.md: delete it, fold it into another, or keep it for a reason you can state. Then stop again."
if [ "$COMMENTS" -gt "$MAX_COMMENTS" ]; then
  echo
  echo "## Comment lines"
  list c
fi
if [ "$TESTS" -gt "$MAX_TESTS" ]; then
  echo
  echo "## Test cases"
  list t
fi
