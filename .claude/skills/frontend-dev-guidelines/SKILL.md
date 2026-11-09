---
name: frontend-dev-guidelines
description: Use when writing or changing components, pages, routes, loaders, server functions, React Query hooks, forms, tables, selects, modals or panels in packages/app-builder or packages/ui-design-system (TanStack Query/Router/Form/Table, SelectV2, MenuCommand, Modal/Panel, Tailwind tokens). For AstBuilder/rule-builder work use ast-builder-developer.
---

# Frontend Development Guidelines

Repo conventions for `packages/app-builder` and `packages/ui-design-system`; path-scoped basics live in `.claude/rules/`.

## Core Conventions

- Components: plain function declarations, named exports, no `React.FC`; the only default export is the Storybook `Meta` in `*.stories.tsx`.
- Text: `t()` from `useTranslation` (`react-i18next`), keys in app-builder's `locales/{en,fr,ar}`. Inside `ui-design-system`, use `t` from `useI18n()` (exported by `ui-design-system`). The keys still live in app-builder (`filters:ds.*`).
- Query hooks wrap the server fn with `useServerFn`, one file per hook in `queries/{domain}/` (`queries/graph/list-relations.ts`).
- Payload schemas shared by a form or hook live in `schemas/{domain}.ts`. Server-only payloads are validated inline in the server fn.

## Repo Gotchas

- **Refresh after a mutation**: `invalidateQueries` does not re-run route loaders. For loader data, call `router.invalidate()` (`useRouter()`) ([data-fetching.md](resources/data-fetching.md#refreshing-data)).
- **Short UUIDs in URLs**: encode ids with `fromUUIDtoSUUID`, decode them in loaders with `fromParams` or `parseIdParamSafe`, read them in components with `useParam` ([routing-guide.md](resources/routing-guide.md)). Exception: `settings/webhooks_.$webhookId.tsx` reads the raw UUID. Check the target loader before encoding.
- **Layout data is already loaded**: under `_builder`, read `useOrganizationDetails`, `useOrganizationUsers`, `useOrganizationTags`, `useOrganizationObjectTags` (`services/organization/`) and `useBuilderLayoutData` (`hooks/routes-layout-data.ts`) instead of fetching again.
- **Permission gating**: compute flags in the loader with predicates from `services/feature-access.ts` and return them (`routes/_app/_builder/detection/lists/$listId.tsx`, for its loader flags and `Page.*` layout only: the rest of that file is legacy). Add new predicates there, not inline in components.
- **Page shell**: `<Page.Main>` contains an optional sticky `<Page.Header>` and a `<Page.Content>` as siblings, often inside `<Page.Container>` (`lists/$listId.tsx`). JSDoc in `components/Page.tsx` lists the `width`, `padding` and `centered` options.
- **Tests**: colocated `*.spec.ts(x)` (vitest + Testing Library), run with `bun run -F <pkg> unit-tests`. New `ui-design-system` components need a `*.stories.tsx`.

## Topic Guides

| Resource | Keywords |
|---|---|
| [component-patterns.md](resources/component-patterns.md) | compound components, memoization, context, refs, CVA, SSR/hydration, new ui-design-system component |
| [data-fetching.md](resources/data-fetching.md) | loaders, server fns, query/mutation hooks, redirects, refreshing data, query keys, server/client boundaries, repositories, middleware |
| [routing-guide.md](resources/routing-guide.md) | route tree, breadcrumbs, navigation, short UUIDs, params/search, `loaderDeps`, feature-gate redirects, downloads/resource-route clients |
| [styling-guide.md](resources/styling-guide.md) | color tokens, typography, spacing, dark mode, variants, RTL, animations |
| [tables-and-selects.md](resources/tables-and-selects.md) | TanStack Table, `useTable`, `useVirtualTable`, row links, `SelectV2`, `MenuCommand` |
| [forms-and-modals.md](resources/forms-and-modals.md) | TanStack Form, form components, `Modal`, `Panel` |
| [common-patterns.md](resources/common-patterns.md) | ts-pattern, feature access, remeda/radash, i18n, icons, toasts, date/number formatting |
| [typescript-standards.md](resources/typescript-standards.md) | type imports, `as`, Zod v4, API unions, error narrowing, model adapters |
