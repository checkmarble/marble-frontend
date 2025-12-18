# Backoffice

This is the internal operator console for Marble. It is used by Checkmarble staff to provision and administer the customer organizations running on a Marble backend: creating an org, seeding its data model, managing its users and roles, toggling gated features, and managing licences.

It is never exposed to customers. Access requires a Marble user whose role is `MARBLE_ADMIN`.

> For the product brief (users, positioning, principles, planned surfaces), see [PRODUCT.md](./PRODUCT.md).

## What it does

- **Organizations launchpad** (`src/components/pages/dashboard.tsx`) — searchable list of every organization, plus the entry point to create a new one.
- **Create organization** (`src/components/organisms/CreateOrganizationPanel/`) — three flows:
  - _Import_ — drop a JSON import spec (org settings, admins, data model tables/fields/links, optional ingestion and decision seeds). `ImportFlow.tsx` renders a full reviewable recap before the operator confirms. Validated by `src/schemas/org-import.ts`.
  - _Archetype_ — apply a backend-provided template and declare the org admins.
  - _Empty_ — create an org from just a name. Newly created orgs get every overridable feature set to `restricted`.
- **Organization overview** (`src/components/pages/organization.overview.tsx`) — configuration, people and feature access for one org. Feature access is edited through `FeatureAccessPanel` (`allowed` / `restricted` / `test`, over the features listed in `src/schemas/features.ts`).
- **Organization users** (`src/components/pages/organization.users.tsx`) — list users and add one. Assignable roles come from `USER_ROLES` in `src/schemas/user.ts`; when the org's `roles` feature is `restricted`, only `ADMIN` is offered.
- **Licences** (`src/components/pages/licenses.tsx`) — list licences with their expiry state, and create or edit one over entitlements grouped into Platform / Screening / Cases (`src/server-fns/licenses.ts`).

## Getting started

### Requirements

- A running Marble backend, reachable at `API_BASE_URL`.
- A user on that backend with the `MARBLE_ADMIN` role.

### Environment

Create your own `.env` file based on `.env.example`:

```bash
cp packages/backoffice/.env.example packages/backoffice/.env
```

Variables validated in `src/env.ts`:

| Variable         | Scope  | Required | Description                                                     |
| ---------------- | ------ | -------- | --------------------------------------------------------------- |
| `API_BASE_URL`   | server | yes      | Base URL of the Marble backend, e.g. `http://localhost:8080`     |
| `SESSION_SECRET` | server | yes      | Secret used to seal the `auth-session` cookie. Any long string.  |
| `VITE_APP_TITLE` | client | no       | Document title                                                   |

Read directly, outside the schema: `VITE_SENTRY_DSN` (`src/router.tsx` and `instrument.server.mjs`) and `PORT` (SSR tRPC base URL, defaults to `3000`).

> There is **no Firebase configuration to set locally.** The app fetches it from the backend's `/config` endpoint at boot (`getAppConfigFn` in `src/server-fns/core.ts`) and initializes the Firebase SDK from that.

### Run

```bash
# from the repo root
bun install

# start the backoffice in dev mode
bun run -F backoffice dev
```

## Authentication

Firebase Google sign-in, exchanged for a Marble token that we keep in an encrypted server-side session cookie.

1. `/sign-in` calls `useFirebase().signInWithGoogle()` (`src/hooks/useFirebase.ts`). Firebase is initialized from `appConfig.auth.firebase`, not from env vars.
2. The resulting Firebase ID token is posted to `signinFn` (`src/server-fns/auth.ts`), which calls `marblecoreApi.postToken` and stores the returned Marble token in the `auth-session` cookie (`src/utils/session.ts`, sealed with `SESSION_SECRET`).
3. `authMiddleware` (`src/middlewares/auth.ts`) reads that token and exposes `context.authFetch` — a `fetch` that adds the bearer header, and on a `401` clears the session and redirects to `/sign-in`. `needAuth` composes it and redirects immediately when there is no valid token.
4. `routes/_app/_private.tsx` additionally requires `currentUser.role === 'MARBLE_ADMIN'`, logging the user out otherwise.
5. On firebase deployments, `TokenRefresher` in the same file re-mints the Marble token from the Firebase ID token every 20 minutes via `refreshTokenFn`.

Every server function that talks to the backend goes through `needAuth`, so `context.authFetch` is the only way data leaves the server.

## Project structure

```
src/
  routes/            # File-based routes (TanStack Router). routeTree.gen.ts is generated — don't edit it.
  components/
    pages/           # One component per screen, mounted by a route
    organisms/       # Multi-step / stateful features (CreateOrganizationPanel, FeatureAccessPanel)
    common/          # ErrorComponent, GridContentLoader
    core/            # SuspenseQuery
  data/              # queryOptions / mutationOptions factories, one file per domain
  server-fns/        # createServerFn handlers — the only place that calls the Marble API
  middlewares/       # authMiddleware / needAuth, appConfigMiddleware, global middlewares
  schemas/           # Zod schemas shared between server fns and forms
  contexts/          # AppConfig, StickyRoots
  hooks/             # useFirebase, useInterval, useIntersection
  integrations/      # TanStack Query client + tRPC wiring
  utils/             # session.ts (auth cookie), user-preferences.ts (theme cookie)
  env.ts             # T3Env schema
  router.tsx         # Router creation, SSR query integration, client Sentry init
  start.ts           # Global middleware registration
```

> Unlike `app-builder`, this package has no `models/` / `repositories/` / `services/` layers. The equivalent split is `server-fns/` (server-side API calls) + `data/` (React Query options) + `schemas/` (validation).

## Routing

| Route file                                     | Role                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `index.tsx`                                    | Server-only `GET`: redirects to `/sign-in` or `/dashboard`                   |
| `__root.tsx`                                   | HTML shell, theme from user preferences, devtools                            |
| `_app.tsx`                                     | Loads the backend app config and provides `AppConfigContext`                 |
| `_app/_public.tsx`                             | Bounces already-authenticated users to `/dashboard`                          |
| `_app/_public/sign-in.tsx`                     | Google sign-in screen                                                        |
| `_app/_private.tsx`                            | Requires auth + `MARBLE_ADMIN`; renders the top bar and the token refresher  |
| `_app/_private/dashboard.tsx`                  | `/dashboard` — organizations launchpad                                       |
| `_app/_private/organizations/$orgId.*.tsx`     | Org layout with `overview` and `users` tabs                                  |
| `_app/_private/licenses/index.tsx`             | `/licenses` — licence management                                             |
| `api.trpc.$.tsx`                               | tRPC fetch adapter mounted at `/api/trpc`                                    |

`routeTree.gen.ts` is regenerated by the router plugin on `dev` and `build`.

## Adding a new screen

1. **Server function** in `src/server-fns/<domain>.ts`. Always go through `needAuth` and pass `context.authFetch` to the `marble-api` client. Validate the input with Zod.

   ```typescript
   export const getWidgetFn = createServerFn({ method: 'GET' })
     .middleware([needAuth])
     .validator(z.object({ widgetId: z.uuid() }))
     .handler(async ({ context, data }) => {
       const { widget } = await backofficeApi.getWidget(data.widgetId, {
         baseUrl: env.API_BASE_URL,
         fetch: context.authFetch,
       });

       return widget;
     });
   ```

2. **Query / mutation options** in `src/data/<domain>.ts`. Mutations declare which query keys they invalidate (see [Conventions](#conventions)).

   ```typescript
   export const getWidgetQueryOptions = (widgetId: string) =>
     queryOptions({
       queryKey: ['widgets', widgetId],
       queryFn: () => getWidgetFn({ data: { widgetId } }),
     });

   export const updateWidget = () =>
     mutationOptions({
       mutationFn: (payload: { widgetId: string; name: string }) => updateWidgetFn({ data: payload }),
       meta: {
         invalidates: (data: { widgetId: string }) => [['widgets', data.widgetId]],
       },
     });
   ```

3. **Route** under `src/routes/_app/_private/`, prefetching in the loader so the data streams with the document.

   ```tsx
   export const Route = createFileRoute('/_app/_private/widgets/$widgetId')({
     component: RouteComponent,
     loader: ({ params, context }) => {
       context.queryClient.prefetchQuery(getWidgetQueryOptions(params.widgetId));
     },
   });

   function RouteComponent() {
     const { widgetId } = Route.useParams();
     return <WidgetPage widgetId={widgetId} />;
   }
   ```

4. **Page component** in `src/components/pages/`, reading the data through `SuspenseQuery` so loading and error states are colocated with the query.

   ```tsx
   const WidgetError = makeQueryErrorComponent(<span>Could not load this widget.</span>);

   export const WidgetPage = ({ widgetId }: { widgetId: string }) => (
     <SuspenseQuery
       query={getWidgetQueryOptions(widgetId)}
       fallback={<GridContentLoader />}
       errorComponent={WidgetError}
     >
       {(widget) => <h1 className="text-h1">{widget.name}</h1>}
     </SuspenseQuery>
   );
   ```

## Conventions

- **Invalidate through `meta.invalidates`.** Mutations don't call `invalidateQueries` themselves; they declare `meta: { invalidates: (variables) => [[...queryKey]] }` and the shared `MutationCache` in `src/integrations/tanstack-query/root-provider.tsx` invalidates every matching query on success. The `meta` shape is typed in `src/global.d.ts`.
- Query defaults are a 10s `staleTime` and no retries on `3xx` `Response` errors — those are the redirects thrown by server functions on auth failure.
- Validate every server function input with Zod (import from `zod/v4`). Shapes shared with forms live in `src/schemas/`.
- Import from `src/` with the `@bo/*` alias (declared in the root `tsconfig.base.json`), e.g. `import { env } from '@bo/env'`.
- UI comes from `ui-design-system` and `ui-icons`; use `cn` from `ui-design-system` for class merging and the shared Tailwind tokens (`surface-card`, `grey-border`, `text-h1`, `gap-md`, …) from `tailwind-preset`.
- `ts-pattern` for branching on discriminated state, `remeda` for data helpers, `sharpstate` for local state in the multi-step organisms, `@tanstack/react-form` for forms.

## Scripts

```bash
# Start the dev server
bun run -F backoffice dev

# Typecheck
bun run -F backoffice type-check

# Lint / format / both (biome)
bun run -F backoffice lint
bun run -F backoffice format
bun run -F backoffice check

# Production build and run
bun run -F backoffice build
bun run -F backoffice start
```

To check the code locally like the CI does, from the repo root:

```bash
bun run -F "*" type-check && bunx biome check
```

## Deployment

Vite builds the app through Nitro (`node-server` preset, see `vite.config.ts`) into `.output/server/index.mjs`. The `build` script also copies `instrument.server.mjs` next to it, which initializes server-side Sentry.

The image is built from `Dockerfile.backoffice` at the repo root (Bun build stage, distroless Node.js 22 runtime, listening on `PORT` — 8080 by default) and deployed to Cloud Run by `.github/workflows/build_and_deploy.yaml`.
