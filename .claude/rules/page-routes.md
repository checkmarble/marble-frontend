---
paths:
  - "**/routes/_app/_builder/**"
  - "**/routes/_app/_auth/**"
---

# Page Route Conventions

- Define routes with `createFileRoute('/path')({ staticData, loader, component })` from `@tanstack/react-router`
- Loaders: inline `createServerFn().middleware([authMiddleware]).handler(async ({ context }) => { ... })` from `@tanstack/react-start`, then pass via `loader: () => myLoader()`
- Auth context via `context.authInfo` (repositories, user, entitlements); services via `context.services`
- `authMiddleware` already handles auth redirects internally — no separate redirect middleware is needed for `_app/_builder` pages
- Use `staticData.BreadCrumbs` (array of render functions receiving `{ isLast }`) for breadcrumbs; access loader data inside the component via `Route.useLoaderData()`
- File-name conventions: `_name.tsx` = layout route, `$param` = dynamic segment, dot-separated filenames = nested URL path (`cases.$caseId.tsx` → `/cases/:caseId`)
- Reference: `routes/_app/_builder/cases.tsx`
