# Domain docs

Use a single-context layout shared across packages:
root `GLOSSARY.md` and `docs/adr/`.

## Before domain exploration

Read the root glossary and ADRs relevant to the work.
If `GLOSSARY-MAP.md` exists, follow it to the relevant glossaries.

When documents are absent, proceed silently. Create them lazily
through domain-modeling when terms or decisions are resolved.

## Vocabulary and decisions

Use glossary terms in specs, issues, proposals, and tests.
Flag terminology gaps for domain-modeling.

Surface conflicts with existing ADRs explicitly, identifying
the ADR and explaining the proposed departure.
