---
paths:
  - "packages/app-builder/src/routes/ressources/**"
  - "packages/app-builder/src/server-fns/**"
---

# Server Endpoint Conventions

Two patterns coexist. Pick by what the endpoint returns.

## Server functions — anything called from React Query

- Export from `server-fns/{domain}.ts` using `createServerFn` from `@tanstack/react-start`: `{ method: 'GET' }` for simple reads, `{ method: 'POST' }` for mutations and for reads with large or structured input such as filters and pagination (`getCasesFn`, `server-fns/analytics.ts`)
- Chain: `.middleware([authMiddleware]).validator(zodSchema).handler(async ({ context, data }) => { ... })`
- Pre-auth endpoints (sign-in, logout, refresh) use `.middleware([servicesMiddleware])` instead: `context.services`, no `context.authInfo` (see `server-fns/auth.ts`)
- Client code calls it via `const myFn = useServerFn(myServerFn)` (from `@tanstack/react-start`), then `myFn({ data })` in `mutationFn` / `queryFn`. `useServerFn` follows a thrown redirect and resolves with `undefined`; a bare call outside React Query only rejects (don't copy the direct `void logoutFn(...)` calls)
- Read auth from `context.authInfo` (repositories, user) and services from `context.services`
- Add repository methods for new API calls; `apiClient` on `context.authInfo` is deprecated
- Status: `setResponseStatus`; cookies: `setCookie` / `useSession`; headers: `setResponseHeader` (all from `@tanstack/react-start/server`). They apply to the request that ran the server fn: the SSR document when a loader or `beforeLoad` calls it on a document load (cookies always, other headers only if the document is 2xx), otherwise its RPC response. So headers every document needs go in a request middleware (`middlewares/security-headers.ts`); the comment in `server-fns/root.ts` saying server-fn headers never reach the document is wrong. There is no `data()` helper
- Redirect with `throw redirect({ to: '/route/$param', params: { ... } })` from `@tanstack/react-router` (type-checked). Use `{ href }` only when no typed route fits: an external URL, an upstream `Location` forwarded as `{ href, statusCode }`, or a URL built from request data (Referer, a preserved query string). `authMiddleware` already covers auth redirects
- Reference: `server-fns/lists.ts`, `server-fns/auth.ts` (pre-auth)

## Resource file routes — downloads, streams, file-typed responses

- File at `routes/ressources/{domain}/...ts` using `createFileRoute('/ressources/...')({ server: { handlers: { GET: async ({ request, params }) => ... } } })`
- `authMiddleware`/`servicesMiddleware` are function middleware and cannot be attached to a server route (`server.middleware` takes request middleware only), so authenticate inside the handler: `const { authService } = initServerServices(request);` (from `@app-builder/services/init.server`), then `const { customListsRepository } = await authService.isAuthenticated(request, { failureRedirect: '/sign-in' });`. Prefer repositories over the deprecated `apiClient`
- Return a web `Response`: `new Response(...)` (CSV downloads, file streaming) or `Response.json(...)`. `useDownloadFile` clients need `Response.json({ url })` or a zip / octet-stream body; other files go out with `Content-Disposition: attachment` and are opened with `<Link reloadDocument>`
- Reference: `routes/ressources/lists/download-csv-file.$listId.ts`
