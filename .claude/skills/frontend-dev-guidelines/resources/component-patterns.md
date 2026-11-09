# Component Patterns

Conventions not already covered by SKILL.md or by `.claude/rules/styling.md` and `deprecations.md`.

## Declaration

`export function Name()` (the ui-design-system core's `export const Name = function Name()` is equivalent). Exceptions:

- Storybook files default-export their `Meta`, named `Story`: `const Story: Meta<typeof Button> = {...}; export default Story;`
- `FunctionComponent<P>` is the type for component-valued data (`components/Breadcrumbs.tsx`).

Older folders with `React.FC` or default exports are legacy.

## ui-design-system imports

- Import values in one statement from the package root. For type-only names, see [typescript-standards.md](typescript-standards.md#type-imports).
- FiltersBar types (`FilterDescriptor`, `FilterValue`, `FilterChange`, `DateRangeFilterType`) aren't re-exported from the root. Import them type-only from `ui-design-system/src/FiltersBar/types`.
- Use `Tooltip.Default content={...}` for tooltips (asChild trigger, with an arrow). Reach for `TooltipV2` only when you need the raw Radix parts. `Tooltip.Provider` is already mounted in `routes/_app.tsx`.

## Compound components

Use a namespace object of plain functions, such as `export const Paper = { Container: PaperContainer, Title: PaperTitle }` (`components/Paper.tsx`). Members can be primitives too (`components/Filters/FilterPopover.tsx`).

## Refs

`ref` is a prop: `{ ref?: React.Ref<HTMLButtonElement> }`. `Card` still uses `forwardRef`, but don't copy it.

Some children are rendered through Radix `asChild`: the children of `Modal.Trigger asChild`, `Popover.Trigger asChild`, `MenuCommand.Trigger` and `Tooltip.Default`. A custom component there must accept `ref` and spread `...props` onto its DOM element. If it doesn't, the menu never opens and the tooltip has no anchor.

## CVA

`Button` has no `asChild`. To style a `<Link>` or an `<a>` as a button, use `className={CtaV2ClassName({ variant: 'secondary', appearance: 'stroked' })}`, as `PageBackLink` does in `components/Page.tsx`.

## Memoization (no React Compiler)

- Wrap context values, table `columns`, and objects or arrays passed as props or effect deps in `useMemo`.
- For a stable callback that still reads the latest props and state, use `useCallbackRef(fn)` from `@marble/shared`. The debounced variant is `useDebouncedCallbackRef(fn, delay)`. Don't use the copy in `@app-builder/utils/hooks`: it updates its ref in an effect, so a call made during render runs the previous closure.
- Keep `memo()` for hot spots (AstBuilder nodes), not as a default.

## Context

`createSimpleContext<T>('Name')` from `@app-builder/utils/create-context` returns `{ Provider, useValue, useOptionalValue }`. In ui-design-system, use the identical copy from `@marble/shared`.

Both hooks throw outside the provider. `useValue` also throws on a falsy value (`null`, `undefined`, `false`, `0`, `''`). `useOptionalValue` passes such a value through, typed `T | null`: use it when the provider may hold `null`, and wrap primitives in an object. Export `useX` hooks, as in `components/Graph/contexts/GraphFocusContext.tsx`.

## SSR and hydration

From `@tanstack/react-router`: `const hydrated = useHydrated()` then `disabled={!hydrated}` on controls that need JS (`components/Scenario/ScenarioHeader.tsx`), and `<ClientOnly fallback={...}>` for browser-only widgets (`routes/_app/_auth/create-password.tsx`).

## New ui-design-system component

- Add `src/Name/Name.tsx`, `Name.stories.tsx` and `Name.spec.tsx`, plus `export * from './Name/Name';` in `src/index.ts`. Imports inside the package follow `.claude/rules/styling.md`.
- Text comes from `useI18n().t`.
- The package's `useFormatting()` and `useFormatLanguage()` return `'en'` defaults unless a `FormattingProvider` is mounted, and only `routes/_app/_builder/detection/analytics/$scenarioId.tsx` mounts one. For locale-dependent output, take the formatted value or the locale as a prop. The app-builder caller gets the locale from `useFormatLanguage()` in `@app-builder/utils/format`, not from the same-named export of `ui-design-system`.
