---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Deprecations

The `@deprecated` tag is the source of truth and usually names its replacement — read the
tag and follow it. Migrate to the replacement's own API rather than forcing the old
markup or props onto it.

A `V2` suffix says nothing on its own: `CaseStatusBadgeV2` replaces the `@deprecated`
`CaseStatusBadge`, while `Tooltip`/`TooltipV2` are both live with no tag, and `ScrollArea`
has no tag but no consumers outside its spec/stories (use `ScrollAreaV2`). Check the tag
and current usage before picking.

Defaults for new code:

- Value pickers: `SelectV2` (built on `MenuCommand`). Action menus and custom dropdowns:
  `MenuCommand`. `Select` from `ui-design-system` is `@deprecated`
- Callouts and banners: `Callout` (`@app-builder/components/Callout`) with
  `color`/`variant`/`icon`; `CalloutV2` only for the neutral purple tip aside
