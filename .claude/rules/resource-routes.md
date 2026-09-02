---
paths:
  - "**/routes/ressources/**"
  - "**/server-fns/**"
---

# Server Endpoint Conventions

Two patterns coexist. Pick by what the endpoint returns.

## Server functions — anything called from React Query

- Export from `server-fns/{domain}.ts` using `createServerFn({ method: 'POST' })` from `@tanstack/react-start`
- Chain: `.middleware([authMiddleware]).validator(zodSchema).handler(async ({ context, data }) => { ... })`
- Call it as `mutationFn: (payload) => myServerFn({ data: payload })`
- Read auth from `context.authInfo` (repositories, user) and services from `context.services`
- Add repository methods for new API calls; `apiClient` on `context.authInfo` is deprecated
- Set headers with `setResponseHeaders(new Headers({ ... }))` from `@tanstack/react-start/server` — there is no `data()` helper
- Redirect with `throw redirect({ href, statusCode })` from `@tanstack/react-router`; `authMiddleware` already covers auth redirects
- Reference: `server-fns/cases.ts`, `server-fns/auth.ts`

## Resource file routes — downloads, streams, file-typed responses

- File at `routes/ressources/{domain}/...ts` using `createFileRoute('/ressources/...')({ server: { handlers: { GET: async ({ request, params }) => new Response(...) } } })`
- Return a raw `Response` (CSV downloads, file streaming)
- Reference: `routes/ressources/lists/download-csv-file.$listId.ts`

Legacy names you will meet in older download routes — `initServerServices`,
`ActionFunctionArgs`, `LoaderFunctionArgs`, Remix `handle`, Remix `json()` — stay where
they are; new code uses the two patterns above.
