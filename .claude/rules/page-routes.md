---
paths:
  - "**/routes/_builder+/**"
  - "**/routes/_auth+/**"
---

# Page Route Conventions

- Use `createServerFn` from `core/requests.ts` + `authMiddleware` from `middlewares/auth-middleware.ts` for loaders and actions
- `_builder+/` page loaders do NOT need `handleRedirectMiddleware` — the browser handles redirects natively during full page loads
- Flat routes with `+` folders: `_builder+/cases+/$caseId.tsx`
- Use `handle` export for breadcrumbs
- Reference: `routes/_builder+/settings+/data-display.tsx` (loader + action)
