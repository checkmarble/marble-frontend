---
paths:
  - "**/ressources+/**"
---

# Resource Route Conventions

- Use `createServerFn` from `core/requests.ts` + `authMiddleware` from `middlewares/auth-middleware.ts` — NOT legacy `initServerServices`/`ActionFunctionArgs`/`json()`
- **Default to `[handleRedirectMiddleware, authMiddleware]`** for routes called via React Query/useFetcher — the redirect middleware intercepts auth redirects (3xx to `/sign-in`) and converts them to `{ redirectTo }` so the client can navigate properly
- Use `[authMiddleware]` alone for mutation actions (delete, create, revoke) or data-fetching endpoints that handle auth errors programmatically
- Access auth context via `context.authInfo` (repositories, user) and services via `context.services`
- Use `data()` from `core/requests.ts` instead of Remix's `json()` for responses with headers
- `apiClient` on `context.authInfo` is deprecated — add repository methods instead
- References: `routes/ressources+/lists+/create.tsx` (with redirect middleware), `routes/ressources+/data+/deleteTable.tsx` (auth only)
