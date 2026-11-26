---
paths:
  - "**/*.tsx"
---

# Styling Conventions

- Merge classes with `cn` from `ui-design-system` (tailwind-merge aware). Never import `clsx` directly (only `packages/ui-design-system/src/utils.ts` wraps it)
- Import UI components from the design system: `import { Button, Modal, cn } from 'ui-design-system'`
- Inside `packages/ui-design-system/src`, import `cn` and sibling components by relative path (`../utils`, `../Button/Button`), never from `'ui-design-system'`
