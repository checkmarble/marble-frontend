---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Tests and comments

Start from none. Every comment and test is read and kept up to date by whoever edits the code next, so each one has to pay that back. A diff carries few enough that a reviewer reads every one.

## Comments

A comment holds a fact the code cannot: a constraint from outside the file (a backend rule, a library or browser quirk), an invariant a later edit could break, or the reason for a choice that looks wrong. The test for each one: without it, would a careful reader make a wrong change? Keep it on a yes.

Everything else has a better home:

- What a function, prop or type field does: its name and type. Rename before explaining.
- What a domain term means: `GLOSSARY.md`, once.
- What the feature does, and why the code changed: the commit message and the PR body.

Write each fact once, on the line that enforces it, in one line when it fits. JSDoc belongs on exported shared components and utilities whose usage the types do not show, such as how to compose them.

A comment describes the code beside it as it is now; the history lives in git.

## Tests

Unit tests are colocated `*.spec.ts(x)` files (vitest + Testing Library).

A test earns its place when it goes red on a bug a reviewer could miss: an edge the types do not cover, a rule a later edit could quietly break. Test each behavior once, at the lowest layer that owns it:

- Models: the rules (what is pending, what counts where, when a case closes).
- Services: what the service adds on top (call order, error handling, redirects).
- Components and pages: the wiring (a shortcut, what renders, a toast), relying on the model specs for the rules.

For a feature, cover the main path and the edges the types miss, and fold variants of one behavior into one `it.each`. A review-fix commit adds a test for a bug the review found. A UI change's evidence in the PR is a screenshot; a test exists to protect behavior.

A test that mirrors the implementation stays green while the behavior is wrong, and costs the same upkeep as one that protects something.

## Budget

The stop hook (`.claude/hooks/tests-comments-budget.sh`) counts the comment lines and test cases your unpushed work adds. Past its budget, it stops you once with the list: audit every item on it, and delete, fold or keep each one for a reason you can state.
