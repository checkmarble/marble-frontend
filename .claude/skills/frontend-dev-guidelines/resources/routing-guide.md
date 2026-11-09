# Routing Guide

File routes in `packages/app-builder/src/routes/`. File name → URL and route ID, `createFileRoute`, loader shapes and breadcrumb typing: `.claude/rules/page-routes.md`. Loader → server fn → repository flow: [data-fetching.md](data-fetching.md).

## Route tree facts

- No 404 page: the `$.tsx` splat sends unknown URLs to `/app-router` (signed in) or `/sign-in`.
- `_app.tsx` is a pathless shell with no auth; `_app/_builder.tsx`'s loader runs `authMiddleware`.
- `/` (`index.tsx`) is only a server handler (GET → 302 `/sign-in`): a client navigation there renders a blank page, so never link or redirect to it.
- Mutations go in `server-fns/`. Don't copy the two legacy route-local ones (`detection/scenarios/$scenarioId/home.tsx`, `.../_edit-view/decision.tsx`).
- Every file under `routes/` is a route candidate unless its name starts with `-`: keep helpers and specs elsewhere or `-`-prefix them.

## Breadcrumbs

`BreadCrumbs` (`components/Breadcrumbs.tsx`) walks `useMatches()` and renders each `staticData.BreadCrumbs` array with `isLast` and `data` = that match's loader data.

- Data from the route's `beforeLoad`: `Route.useRouteContext()` (`detection/scenarios/$scenarioId.tsx`, `detection/scenarios/$scenarioId/i/$iterationId.tsx`).
- One array shared by several routes: type it `FunctionComponent<BreadCrumbProps<T>>[]`, read `data`, and make each route's loader return `T` (`caseDetailBreadcrumbs` in `components/CaseManager/case-detail-breadcrumbs.tsx`, used by `cases/_detail/s.$caseId.tsx` and `m.$caseId/index.tsx`).
- Translate inside the component with `useTranslation([...])`. `staticData.i18n` and exported `handle = { i18n }` objects are Remix leftovers nothing reads: don't add them.

## Navigation

- `to` is typed: `$param` paths plus `params`, never `:param` or template strings.
- `to` and Link / `navigate` `from` take the URL path (no `_app`, `_builder` or other pathless segments); `from` on `useLoaderData` / `useRouteContext` takes the route ID (`/_app/_builder/...`, as in `routeTree.gen.ts`).
- Need a URL string (`fetch`, `useDownloadFile`)? `useRouter().buildLocation({ to, params }).href`.
- `useAgnosticNavigation` (`contexts/AgnosticNavigationContext`) is a legacy string-path adapter: use `Link` / `useNavigate` in new code.

### Ids in URLs

- Page URLs carry short UUIDs: encode with `fromUUIDtoSUUID` in `params`; decode in the loader with `fromParams(params, 'xId')` (`utils/short-uuid`, throws if missing), `shortUUIDSchema`, or `await parseIdParamSafe(params, 'xId')` (`utils/input-validation`: returns `{ success, data }` so you throw the 404 yourself). Components read the decoded id with `useParam('xId')`.
- On document loads `middlewares/short-uuid-redirect.ts` 302s any long UUID in a page path to its short form (not under `/client-detail/`, `/ressources/`, `/oidc/`), so page loaders must decode.
- Linking to an existing route? Check what it decodes. Most `ressources/` handlers read raw ids (only `lists/download-csv-file` and `cases/next-unassigned` decode), and so does `settings/webhooks_.$webhookId` (links pass `webhook.id`; don't copy it for new pages).
- Case detail: `/cases/$caseId` redirects to `/cases/s/$caseId` (standard) or `/cases/m/$caseId` (continuous screening); link to `s`/`m` when the type is known.
- Client detail: `params={clientDetailLinkParams(objectType, objectId)}` (`utils/routes/client-detail-url`); ids containing `/` are base64url-encoded.

## Loaders: repo specifics

Shapes: page-routes rule.

- `loaderDeps` must return every search key the loader reads, or changing that key won't re-run it.
- Feature gate: check a `services/feature-access` predicate in the loader and `throw redirect({ to: '/app-router' })`, not the legacy `redirect({ to: '/' })`.
- Parent data for child loaders: return it from the parent's `beforeLoad` (route context, `detection/scenarios/$scenarioId.tsx`). For child components only, the parent loader is enough: `useLoaderData({ from: '<parent route ID>' })`. Wrap either in a hook in `hooks/routes-layout-data.ts`. `beforeLoad` is not cached and also runs on hover preload: keep it cheap and side-effect free.
- Refreshing loader data after a mutation: [data-fetching.md](data-fetching.md).

## Resource file routes

Handler shape: `.claude/rules/resource-routes.md`. The client depends on the response:

- Signed link (`Response.json({ url })`, `ressources/cases/download-file.$fileId.ts`) or zip / octet-stream body: `useDownloadFile(href)` (`services/DownloadFilesService.ts`; rejects any other content type), as in `components/CaseManager/CaseDocuments/CaseFileButton.tsx`.
- File body with `Content-Disposition: attachment` (the CSV route): a document link, `<Link reloadDocument to="/ressources/lists/download-csv-file/$listId" params={{ listId: fromUUIDtoSUUID(listId) }}>`.
