---
paths:
  - "**/routes/ressources/**"
  - "**/server-fns/**"
---

# Server Endpoint Conventions

Two patterns coexist for server endpoints called from the client:

## Server Functions (preferred for new React Query endpoints)

- Export from `server-fns/{domain}.ts` using `createServerFn({ method: 'POST' })` from `@tanstack/react-start`
- Chain: `.middleware([authMiddleware]).validator(zodSchema).handler(async ({ context, data }) => { ... })`
- Call from React Query: `mutationFn: (payload) => myServerFn({ data: payload })`
- Access auth via `context.authInfo` (repositories, user); services via `context.services`
- Set response headers via `setResponseHeaders(new Headers({ ... }))` from `@tanstack/react-start/server` — no `data()` helper exists
- Redirects: `throw redirect({ href, statusCode })` from `@tanstack/react-router`; `authMiddleware` already handles auth-redirect cases
- Reference: `server-fns/cases.ts`, `server-fns/auth.ts`

## Resource File Routes (downloads, streams, file-typed responses)

- File at `routes/ressources/{domain}/...ts` using `createFileRoute('/ressources/...')({ server: { handlers: { GET: async ({ request, params }) => new Response(...) } } })`
- Return raw `Response` objects (e.g., for CSV downloads, file streaming)
- Reference: `routes/ressources/lists/download-csv-file.$listId.ts`

## General

- `apiClient` on `context.authInfo` is deprecated — add repository methods instead
- Do NOT use `initServerServices` / `ActionFunctionArgs` / `LoaderFunctionArgs` / Remix `handle` / Remix `json()` for new code — a few legacy download routes still use `initServerServices` but new code should not
