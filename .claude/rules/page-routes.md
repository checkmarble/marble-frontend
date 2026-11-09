---
paths:
  - "packages/app-builder/src/routes/_app/**"
---

# Page Route Conventions

- Define routes with `createFileRoute('<route ID>')({ staticData, loader, component })` from `@tanstack/react-router`. The ID is the file path under `routes/`, not the URL: extension dropped, dots turned into `/`, `index` turned into a trailing `/`, pathless `_` segments and trailing `_` kept (`'/_app/_builder/cases'`, `'/_app/_builder/cases/$caseId/'`, `'/_app/_builder/settings/webhooks_/$webhookId'`). The router plugin writes and corrects it
- Loaders: inline `createServerFn().middleware([authMiddleware]).handler(async function myLoader({ context }) { ... })` from `@tanstack/react-start` (`authMiddleware` from `@app-builder/middlewares/auth-middleware`), then pass via `loader: () => myLoader()`
- With params: add `.validator((input: { params?: Record<string, string> } | undefined) => input)` and call `loader: ({ params }) => myLoader({ data: { params } })`. With search: declare `validateSearch: schema` and `loaderDeps: ({ search }) => ({ ... })`, validate the input with a zod `.validator(...)`, and call `loader: ({ deps }) => myLoader({ data: deps })` (`client-detail/index.tsx`; params + search: `cases/inboxes.$inboxId.tsx`)
- `_app/_builder` pages: auth context via `context.authInfo` (repositories, user, entitlements), services via `context.services`. `authMiddleware` handles auth redirects itself — no separate redirect middleware
- Pages without a session (`_app/_auth/*`, `_app/onboarding.tsx`) use `.middleware([servicesMiddleware])` (from `@app-builder/middlewares/services-middleware`): `context.services` (including `authService`) and `context.appConfig`, no `context.authInfo`. Never add `authMiddleware` there — it redirects signed-out users to `/sign-in`
- Breadcrumbs: `staticData.BreadCrumbs`, an array of components typed `({ isLast }: BreadCrumbProps) => ...` (`BreadCrumbProps` from `@app-builder/components/Breadcrumbs`; props are `{ isLast, data }`, `data` being that route's loader data). The annotation is required because `staticData` is untyped. Access loader data inside the component via `Route.useLoaderData()`
- File names: nest with folders (`cases/$caseId.tsx` → `/cases/$caseId`); `index.tsx` = folder index; `name.tsx` beside `name/` = layout rendering `<Outlet />`; `_name` = pathless layout (no URL segment); `$param` = dynamic segment; trailing `_` (`settings/webhooks_.$webhookId.tsx`) escapes the `webhooks.tsx` layout but stays inside `settings`, URL unchanged (`/settings/webhooks/$webhookId`); dot-flat names (`inboxes.$inboxId.tsx`) exist but are the minority
- Reference: `routes/_app/_builder/cases.tsx`
