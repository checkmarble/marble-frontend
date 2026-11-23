---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Tests and comments

## Comments

Write a comment only for something a reader cannot deduce from the code, and that is not obvious once they look: a constraint, an invariant, or the reason a non-obvious choice was made. Names, types, and control flow already say what they do, so leave them uncommented. JSDoc on an exported shared component that shows how to compose or use it counts: the types do not say that.

A comment that earns its place is readable in one pass. State the fact in plain words, in the order a reader needs it. A comment that paraphrases the next line hides the ones that matter and goes stale the moment the code moves.

A comment ALWAYS describes the code it sits next to, as that code is now. It NEVER describes the diff: not what this change did, not what the previous line did, not why the PR touches it. The history lives in git. A reader later has only the code and the comment, and a note about the change is noise the moment the change lands.

## Tests

Unit tests are colocated `*.spec.ts(x)` files (vitest + Testing Library).

Add a test when it would catch a problem or a regression the code can hide: an edge the types do not cover, a behavior a later edit would break without anyone noticing.

A test that only mirrors the implementation, written so the change feels covered, does not earn its place. It stays green while the behavior is wrong, and it costs the same upkeep as a test that protects something.
