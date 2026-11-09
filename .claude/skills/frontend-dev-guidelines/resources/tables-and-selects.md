# Tables & Selects

Tables use TanStack Table **v9** through `ui-design-system`; selects use `SelectV2` or `MenuCommand`.

## Tables

### Which hook

- `useTable` from `ui-design-system` by default. TanStack's own `useTable` (no `rowLink`, no DS defaults, `features: marbleTableFeatures` by hand) is only for custom-markup grids (`as useTanStackTable` in `components/DataModelExplorer/DataTableRender.tsx`).
- `useVirtualTable` for long client-side lists: adds row virtualization, `isEmpty` and `scrollToTop`, and needs a bounded container (`max-h-*` on `Table.Container`).
- Both return `{ table, rows, getBodyProps, getContainerProps }`. `<Table.Default {...result} />` renders the standard markup in a `max-h-96` container; otherwise compose `Table.Container` / `Header` / `Body` / `Row` as in `routes/_app/_builder/detection/lists/index.tsx`.
- Simple settings lists: pass the `useTable` result as `table` to `SettingCard` (`components/Settings/settingCard.tsx`), as in `components/Settings/Inboxes/InboxMembers.tsx`.

### v9 API (not v8)

- Helpers and types take the features first: `createColumnHelper<MarbleTableFeatures, TData>()`, `ColumnDef<MarbleTableFeatures, TData>`, `Row<MarbleTableFeatures, TData>`.
- No `getCoreRowModel()` / `getSortedRowModel()` options: the core row model is built in, and the sorted and filtered row models come from `marbleTableFeatures`.
- The column sort option is `sortFn`, not `sortingFn`.

### Sorting & filtering

The DS hooks default to `manualSorting: true` and `manualFiltering: true`: without a mode, a header click flips the arrow but rows keep server order. Pick one:

- **Client sort**: `manualSorting: false`.
- **Server sort**: controlled `state.sorting` + `onSortingChange` + `enableSortingRemoval: false` (`components/Cases/Inbox/CasesList.tsx`).
- **No sort**: `enableSorting: false`.
- **Client search**: `manualFiltering: false` + `table.setGlobalFilter(value)`.

### Resizing, row links, selection

- Resizing is on by default: pass `columnResizeMode: 'onChange'` so widths follow the drag; disable with `enableColumnResizing: false`.
- `rowLink` returns a bare `<Link to=... params=... />`. `Table.Row` forwards any click in the row to that link, so cells with buttons, checkboxes or menus wrap them in `onClick={(e) => e.stopPropagation()}`.
- Selectable rows: `useTanstackTableListSelection(data, getRowId)` (`hooks/useTanstackTableListSelection.ts`) in the page; in the table, spread its `tableProps` into `useTable`, pass `state: { rowSelection: selectionProps.rowSelection }` + `enableRowSelection`, and prepend `...getTableSelectColumn(columnHelper, selectable)` (`utils/table-selection.tsx`, already stops the click reaching the row link): `detection/decisions/index.tsx` → the `useTable` call in `components/Decisions/DecisionsList.tsx` (ignore that file's dead `useSelectedDecisionIds`).

## Selects & Menus

- **Static option list** (single or `multiple`): `SelectV2` from `ui-design-system` (controlled `value` / `onChange`, `options: { label, value }[]`, `placeholder`). Only the `Select` namespace in the same file is `@deprecated`.
- **Search, groups, submenus, custom rows, action menus**: compose `MenuCommand`. Composition: JSDoc on `Menu` in `packages/ui-design-system/src/MenuCommand/MenuCommand.tsx`; searchable select: `components/Settings/FormSelectTimezone.tsx`.
- **List inside an existing popover/panel**: `MenuCommand.Inline` instead of `Menu` + `Content`. It never closes the host and does no filtering (the caller filters): `components/Decisions/Filters/FilterDetail/ScenarioFilter.tsx`.

### MenuCommand gotchas

- **Closing**: selecting an item calls your `onOpenChange(false)`, so only a controlled menu (`open` + an `onOpenChange` that updates it) closes; an uncontrolled `Menu`, even with `onOpenChange`, stays open. Don't also call `setOpen(false)` in `onSelect`. `persistOnSelect` keeps it open (multi-select) and is inherited by `SubMenu`.
- **Read once**: `persistOnSelect` and the `onOpenChange` used on select are captured at mount. Keep them static (pass `setOpen`, or a closure over setters only), or remount the `Menu` with a `key` when they change.
- **Filtering**: cmdk matches the Item `value` (plus `keywords`), else the rendered text. Set a unique `value` (`${label} ${id}`) when the row renders more or less than what should be searchable, and read the selection from the closure, not from `onSelect`'s argument.
- **Caller-side search**: `Combobox onValueChange` → `useDeferredValue` → `matchSorter` (`@app-builder/utils/search`) → `<Highlight text query />` (`@app-builder/components/Highlight`). With cmdk filtering still on, a row shows only if both match: point the matchSorter keys and the Item `value` at the label the user sees. Virtualized lists need `shouldFilter={false}` on `Content`: cmdk only sees mounted rows.
- **Trigger** child must accept `ref` and spread `...props` onto its DOM element (Radix `asChild`): a DS `Button` for action menus, `MenuCommand.SelectButton` for selects (`size`, `readOnly`, `noArrow`; its `hasError` prop is ignored, so show an error with `className="border-red-primary"`).
- **Less obvious parts**: `Empty`, `SubMenu` (requires `trigger`, opens on hover by default), `HeadlessItem` (unstyled), `Content` props `sameWidth` / `size="small"` / `shouldFilter`, and `MenuCommand.State.useSharp().value.search` to read the search from deep children (`components/AstBuilder/edition/OperandMenu/index.tsx`).
