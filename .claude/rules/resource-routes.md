---
paths:
  - "**/ressources+/**"
---

# Resource Route Conventions

- Use `createServerFn` + `authMiddleware` from `core/requests.ts` — NOT legacy `initServerServices`/`ActionFunctionArgs`/`json()`
- **`ressources+/` routes MUST include `handleRedirectMiddleware`** — these routes are called via React Query/useFetcher from the client; the middleware intercepts auth redirects (3xx to `/sign-in`) and converts them to `{ redirectTo }` so the client can navigate properly. Use `[handleRedirectMiddleware, authMiddleware]` as the middleware array.
- Access auth context via `context.authInfo` (repositories, user) and services via `context.services`
- Use `data()` from `core/requests.ts` instead of Remix's `json()` for responses with headers
- `apiClient` on `context.authInfo` is deprecated — add repository methods instead
- Reference: `routes/ressources+/data+/deleteTable.tsx` (action)
