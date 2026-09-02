---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Deprecations

The `@deprecated` tag is the source of truth, and it names its own replacement — read the
tag and follow it. Migrate to the replacement's own API rather than forcing the old
markup or props onto it.

A `V2` suffix carries no information about which export is current. Both directions exist
in this codebase right now:

- `Collapsible` (`ui-design-system`) is current; the `CollapsibleV2` it replaced is gone
- `CalloutV2` (`app-builder/components/Callout.tsx`) is current; plain `Callout` is the older one

Conventions the code does not encode, so they live only here:

- Reach for `CalloutV2` for new callout and banner components
- Reach for `MenuCommand` for new dropdowns — `Select` from `ui-design-system` is
  deprecated in favour of it
