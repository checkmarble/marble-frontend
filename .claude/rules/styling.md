---
paths:
  - "**/*.tsx"
---

# Styling Conventions

- Merge classes with `cn` from `ui-design-system` (tailwind-merge aware). Don't add new `clsx` imports; about 50 legacy files still have them
- Import UI components from the design system: `import { Button, Modal, cn } from 'ui-design-system'`
- Inside `packages/ui-design-system/src`, import `cn` and sibling components by relative path (`../utils`, `../Button/Button`), never from `'ui-design-system'`
