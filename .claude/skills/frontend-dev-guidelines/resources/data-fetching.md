# Data Fetching

Page data: route loaders. Client data: `queries/{domain}/` hook → `server-fns/{domain}.ts` → repository. Downloads: resource routes (`.claude/rules/resource-routes.md`).

## Route Loaders

Shape: `.claude/rules/page-routes.md`. `defaultPreload: 'intent'` (`router.tsx`) runs loaders on link hover/focus: keep them read-only and cheap. A `setToast` before a loader redirect is stored even without a click and surfaces on a later page; set `preload: false` on that route.

## Server Functions

Chain, method, status, cookies, redirects: `.claude/rules/resource-routes.md`. Reference: `createListFn` in `server-fns/lists.ts`.

- Payload shared with a form or hook: schema in `schemas/{domain}.ts`. Server-only payload: validate inline (`.validator(z.object({ ... }))`).
- Expected failures the UI explains: return `{ error: '<code>' as const }` (map API errors with `isStatusConflictHttpError`, `isNotFoundHttpError`, … from `@app-builder/models`). Otherwise throw a generic `Error`.
- In a `try/catch` around repository calls, re-throw any 3xx `Response` first: `if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;`. This also catches the plain 302 `Response` thrown when a 401 can't be refreshed (`refreshToken` in `services/auth/auth.server.ts`), which `isRedirect()` misses.

## Query and Mutation Hooks

One hook per file in `queries/{domain}/` (a few legacy files sit at the `queries/` root). Wrap the server fn with `useServerFn` and call it with `{ data }`. References: `queries/graph/list-relations.ts`, `queries/cases/edit-name.ts`.

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

Default import protection (`vite.config.ts` sets none) keeps `**/*.server.*` files and `@tanstack/react-start/server` out of the client. `build` fails on a violation; `dev` only mocks the import (terminal warning, console error on access), so dev works while the build breaks.

- A value import of either is allowed only if every use sits in code the build strips from the client: a `createServerFn` `.handler()`, a middleware `.server()`, a file route's `server: { handlers, middleware }`, or `createIsomorphicFn().server()` (`router.tsx`). Example: `getPreferencesCookie` in `routes/_app/_builder/cases/inboxes.$inboxId.tsx`.
- Anywhere else (components, query hooks), import types only: `import { type AuthPayload } from '@app-builder/services/auth/auth.server'`.
- Components import `server-fns/*.ts`, so their top-level code and non-handler exports reach the client. Keep server-only calls inside `.handler()`.
- `*-client.ts` files (`services/init-client.ts`, `utils/csrf-client.ts`) escape the `**/*.client.*` rule (hyphen), so the server can still import them.

## Adding a Repository

A repository reaches `context.authInfo` only after wiring in four places (copy `repositories/GraphRepository.ts`):

1. `repositories/XRepository.ts`: `export interface XRepository` and `export function makeGetXRepository()` returning `(marbleCoreApiClient: MarbleCoreApi): XRepository => ({ ... })`, which adapts DTOs to models.
2. `repositories/init.server.ts`: add `getXRepository: makeGetXRepository()` to `makeServerRepositories`.
3. `services/auth/auth.server.ts`: add the field to `interface AuthenticatedInfo`, keyed by the short domain name (`graph`, `customerAggregates`; `xRepository` keys are older). Add `getXRepository` to `MakeAuthenticationServerServiceArgs`, destructure it in `makeAuthenticationServerService`, and instantiate it in the object `isAuthenticated` returns (`graph: getGraphRepository(marbleCoreApiClient)`).
4. Read it in handlers as `context.authInfo.<key>`. Never add `authInfo.apiClient` calls (`@deprecated`).

Unauthenticated repositories (app config, onboarding, feature access) go on `context.services`: register them in `makeServerRepositories`, then build them in `makeServerServices` (`services/init.server.ts`).

## Middleware

| Middleware | Use |
|---|---|
| `authMiddleware` | Authenticated handlers. Chains `servicesMiddleware`, redirects to `/sign-in`, provides `context.authInfo` |
| `servicesMiddleware` | Alone, for handlers without a session: `context.services`, `context.appConfig` |
| `caseDetailMiddleware` | Case-detail loaders. Reads `data.params.caseId`, adds `context.case` (`{ detail, inbox }`) and `context.inboxes`, and redirects away if the case can't be loaded (`routes/_app/_builder/cases/$caseId/index.tsx`) |
| `rateLimitFunctionMiddleware({ max, windowMs, scope? })` | Per-user (default) or `'organization'` limit for a server fn. Chains `authMiddleware`. Server routes use `rateLimitRequestMiddleware({ max, windowMs })` |

Never add `servicesMiddleware` next to `authMiddleware`. List middleware that chains `authMiddleware` after it (`[authMiddleware, caseDetailMiddleware]`); TanStack dedupes it.
