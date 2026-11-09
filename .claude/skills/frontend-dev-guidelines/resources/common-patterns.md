# Common Patterns

Cross-cutting conventions in `packages/app-builder/src`.

## Query state in JSX

Use ts-pattern: `match(query).with({ isPending: true }, …).with({ isError: true }, …).with({ isSuccess: true }, ({ data }) => …).exhaustive()`. See `components/CustomerKpis/CustomerKpis.tsx`.

## Feature access

Every gate is a predicate in `services/feature-access.ts`, covering both role permissions (`isEditListAvailable(user)`) and entitlements (`isAccessible(entitlements.workflows)`). Add new gates there, not inline. Call them in the loader and return the results as flags (`routes/_app/_builder/detection/lists/$listId.tsx`).

Entitlement levels are `FeatureAccessLevelDto` (`'allowed' | 'test' | 'restricted' | 'missing_configuration'`, from `marble-api/generated/feature-access-api`), and `isAccessible` means `allowed` or `test`. When the level is not `allowed`, show `<Nudge kind={access} content={t(…)} />` (`components/Settings/Users/CreateUser.tsx`).

## Utilities

- `tryCatch` (`@app-builder/utils/tryCatch`) returns `{ ok: true, value } | { ok: false, error: Error }`, or a `Promise` of that when given an async function or a promise. Prefer it to the legacy radash `tryit`.
- Transform data with remeda (`import * as R from 'remeda'`). For multi-select state, use radash's `toggle(list, item)`.

## i18n

- `t()` keys are **not** type-checked, because `services/i18n/i18next.d.ts` types them against `resources['en']`, which doesn't exist (locales are `en-GB`, `en-US`, `fr`, `ar`). Check that the key exists in `locales/en/<file>.json`.
- Namespace ids are the camelCase keys in `services/i18n/resources/en.ts`, so `continuousScreening` maps to `continuous-screening.json`. Adding keys or namespaces: `.claude/rules/i18n.md`.
- Don't add `export const handle = { i18n }` (Remix-era).
- On the server (server fn handler or function middleware): `const t = await context.services.i18nextService.getFixedT(getRequest(), ['common', 'cases'])`, with `getRequest` from `@tanstack/react-start/server` (`addRuleSnoozeFn` in `server-fns/cases.ts`).

## Icons

Render with `<Icon icon="delete" className="size-5" />` from `ui-icons` and type icon props as `IconName`. To add an icon, put a mono SVG in `packages/ui-icons/svgs/icons` and run `bun run -F ui-icons generate-icons`. Multicolour marks go in `svgs/logos` and render with `<Logo logo=… />`. For RTL, see [styling-guide.md](styling-guide.md#rtl).

## Toasts

The calling component toasts with `toast` from `react-hot-toast`:

```tsx
await mutation.mutateAsync(value)
  .then((res) => {
    if (res && 'error' in res) return toast.error(t('common:errors.list.duplicate_list_name'));
    onSuccess();
  })
  .catch(() => toast.error(t('common:errors.unknown')));
```

- Expected failures are **returned** (`{ error: '<code>' }`), not thrown. `res` is `undefined` after a server-side redirect ([data-fetching.md](data-fetching.md)).
- Exception: data-model table mutations throw `getTableMutationError(error, t)`. The hook's `onError` checks `isTableMutationError` and toasts `formatTableMutationError(error)`. See `editSemanticTableFn` (`server-fns/data.ts`) and `queries/data/edit-semantic-table.ts`.
- Toast before a server redirect: `await setToast({ type: 'error', message: t(…) })` (`@app-builder/services/toast.server`), then `throw redirect(…)`. Server-only: call it in a `createServerFn` handler (a loader's included), a function middleware or `*.server.ts`, never in the isomorphic `loader:` itself. In a loader, also set `preload: false` on the route, or a link hover stores the toast early ([data-fetching.md](data-fetching.md)). `messageKey` is `@deprecated`; pass a translated `message`.

## Dates and numbers

Helpers are in `@app-builder/utils/format`.

- Locale: `useFormatLanguage()`, set by the root loader so SSR and hydration agree; never `i18n.language`, `navigator.language` or `toLocale*()` in render (old code does). It is a plain string: don't switch exhaustively on it.
- In components, `useFormatDateTime()` applies the user's locale **and timezone**. `formatDateTimeWithoutPresets(ts, { language, … })` ignores the timezone unless you pass `timeZone: useFormatTimezone()`.
- `formatNumber`, `formatPercentage`, `formatDuration` and `formatDateRelative` take the `language`. `formatCurrency` takes a Dinero currency object, not an ISO code. For date-fns, pass `locale: getDateFnsLocale(language)` (`services/i18n/i18n-config`).
