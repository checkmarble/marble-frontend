# Data Fetching

Page data: route loaders. Client data: `queries/{domain}/` hook → `server-fns/{domain}.ts` → `context.api` + a `models/` adapter. Downloads: resource routes (`.claude/rules/resource-routes.md`).

## Route Loaders

Shape: `.claude/rules/page-routes.md`. `defaultPreload: 'intent'` (`router.tsx`) runs loaders on link hover/focus: keep them read-only and cheap. A `setToast` before a loader redirect is stored even without a click and surfaces on a later page; set `preload: false` on that route.

## Server Functions

Chain, method, status, cookies, redirects: `.claude/rules/resource-routes.md`. Reference: `createListFn` in `server-fns/lists.ts`.

- Payload shared with a form or hook: schema in `schemas/{domain}.ts`. Server-only payload: validate inline (`.validator(z.object({ ... }))`).
- Expected failures the UI explains: return `{ error: '<code>' as const }` (map API errors with `isStatusConflictHttpError`, `isNotFoundHttpError`, … from `@app-builder/models`). Otherwise throw a generic `Error`.
- In a `try/catch` around API calls, re-throw redirects first: `if (isRedirect(error)) throw error;` (`@tanstack/react-router`). A 401 that can't be refreshed throws one from inside the API call (`getTokenService` in `server/auth.ts`).

## Query and Mutation Hooks

One hook per file in `queries/{domain}/`. Wrap the server fn with `useServerFn` and call it with `{ data }`. References: `queries/graph/list-relations.ts`, `queries/cases/edit-name.ts`.

- **Redirects**: `useServerFn` catches a thrown redirect (yours, or `authMiddleware`'s `/sign-in`), navigates, and resolves with `undefined`. So `mutateAsync().then((res) => ...)` must accept `undefined` (snippet: [common-patterns.md](common-patterns.md#toasts)); a `useQuery` ends in error after navigating. Unwrapped, React Query still navigates (`setupRouterSsrQueryIntegration` in `router.tsx`, via cache `onError`), but the call fails and `onError`/`.catch` fire (e.g. an error toast on session expiry). Outside React Query, a bare call only rejects.
- **Thin mutations**: `useServerFn` + `useMutation` + `mutationKey`, plus `invalidateQueries` in `onSuccess` for React Query data. The calling component narrows `res.error` and toasts ([common-patterns.md](common-patterns.md#toasts); build the form itself per [forms-and-modals.md](forms-and-modals.md)); toast in the hook only if every caller shows the same message.
- **Infinite lists**: `PaginatedResponse<T>` (`models/pagination.ts`), `initialPageParam: null as string | null`, next `offsetId` = last item's `id`, `placeholderData: keepPreviousData` (`useContinuousScreeningUpdateJobsInfiniteQuery` in `queries/continuous-screening/update-jobs.ts`).

## Query Keys and Defaults

Inline arrays, domain first: `['cases', caseId, 'get-details']`. Export a key from its query file when sibling hooks invalidate it (`graphRelationsQueryKey`). Defaults (`integrations/tanstack-query/root-provider.tsx`): `staleTime` 10s, 3xx errors not retried (others up to 3 times), superjson (de)hydration, and a `MutationCache` that invalidates the keys returned by `meta: { invalidates: (variables) => [[...]] }` (typed in `global.d.ts`).

## Refreshing Data

Loader data (`Route.useLoaderData()`) and React Query data are separate caches.

- **Loader data**: after `mutateAsync` resolves, call `router.invalidate()` (`useRouter()` from `@tanstack/react-router`). `await` it when the next step needs the fresh data (`components/Settings/Inboxes/InboxPanel.tsx`).
- **React Query data**: `queryClient.invalidateQueries({ queryKey })` or `meta.invalidates`. Neither re-runs loaders.
- Don't copy `useLoaderRevalidator()` (legacy Remix-era wrapper that drops the promise). Use `router.invalidate()`.

## Server/Client Boundaries

Import protection (`importProtection` in `vite.config.ts`) keeps `**/*.server.*` files, `src/server/**` and `@tanstack/react-start/server` out of the client. Setting `client.files` replaces the defaults, so keep `**/*.server.*` in that list. `build` fails on a violation; `dev` only mocks the import (terminal warning, console error on access), so dev works while the build breaks.

- A value import of either is allowed only if every use sits in code the build strips from the client: a `createServerFn` `.handler()`, a middleware `.server()`, a file route's `server: { handlers, middleware }`, or `createIsomorphicFn().server()` (`router.tsx`). Example: `getPreferencesCookie` in `routes/_app/_builder/cases/inboxes.$inboxId.tsx`.
- Anywhere else (components, query hooks), import types only: `import { type AuthPayload } from '@app-builder/server/auth'`.
- Components import `server-fns/*.ts`, so their top-level code and non-handler exports reach the client. Keep server-only calls inside `.handler()`.
- `*-client.ts` files (`services/auth/auth-client.ts`, `utils/csrf-client.ts`) escape the `**/*.client.*` rule (hyphen), so the server can still import them.

## Calling the Marble API

Handlers behind `authMiddleware` call the generated client on `context.api` (`MarbleCoreApi`, `infra/marblecore-api.ts`) and adapt the DTO with the adapter in `models/`:

```ts
.handler(async ({ context: { api }, data }) => {
  const { custom_list } = await api.getCustomList(data.listId);
  return adaptCustomListWithValues(custom_list);
});
```

- A call and its adapter form one operation, so a plain function `fn(api, args)` in `server/{domain}.ts` that returns the model is fine even with a single caller (`listCustomLists` in `server/custom-lists.ts`). Logic spanning several calls or reshaping arguments belongs there too. A one-off call can also stay inline, as above. `server/**` is server-only, so import it only from handler code.

## Middleware

| Middleware | Use |
|---|---|
| `authMiddleware` | Authenticated server fns and resource routes (request middleware). Redirects to `/sign-in`, provides `context.api`, `context.user`, `context.entitlements`, `context.tokenService` |
| `appConfigMiddleware` | Handlers that read `context.appConfig`, with or without a session (`[authMiddleware, appConfigMiddleware]`). `getAppConfig(request)` in `server/app-config.ts` fetches it once per request, so SSR loaders share one call |
| `caseDetailMiddleware` | Case-detail loaders. Reads `data.params.caseId`, adds `context.case` (`{ detail, inbox }`) and `context.inboxes`, and redirects away if the case can't be loaded (`routes/_app/_builder/cases/$caseId/index.tsx`) |
| `rateLimitIpFunctionMiddleware({ max, windowMs })` | Per-client-IP limit for a server fn called before sign-in, listed first (`discoverSignInFn`) |

The limiter rejects with HTTP 429 and `TOO_MANY_REQUESTS_ERROR_MESSAGE`; match it client-side with `isTooManyRequestsError`.

Pre-auth handlers (sign-in, logout, refresh) need no middleware: call `server/auth.ts` functions directly. List middleware that chains `authMiddleware` after it (`[authMiddleware, caseDetailMiddleware]`); TanStack dedupes it.
