# Tables & Selects

Virtual tables with TanStack Table and MenuCommand dropdowns.

---

## Virtual Tables

Tables use TanStack React Table with virtual scrolling via `useVirtualTable` from ui-design-system.

### Canonical Example

Reference: `routes/_builder+/detection+/lists+/_index.tsx`

```typescript
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Table, useVirtualTable } from 'ui-design-system';
import { Link } from '@remix-run/react';

const columnHelper = createColumnHelper<CustomList>();

export function ListsTable({ customLists }: { customLists: CustomList[] }) {
  const { t } = useTranslation(['lists']);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: t('lists:name'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: t('lists:description'),
        size: 500,
      }),
    ],
    [t],
  );

  const { table, isEmpty, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: customLists,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({ id }) => (
      <Link to={getRoute('/detection/lists/:listId', { listId: id })} />
    ),
  });

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <Table.Container {...getContainerProps()} className="bg-surface-card max-h-[70dvh]">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
}
```

### Key API

- `useVirtualTable(options)` returns `{ table, isEmpty, getBodyProps, rows, getContainerProps }`
- `rowLink` makes entire rows clickable (optional)
- Virtual scrolling handles 2500+ rows efficiently
- `columnResizeMode: 'onChange'` enables drag-to-resize columns
- `getSortedRowModel()` enables column header sorting

### Table Components

```typescript
<Table.Container {...getContainerProps()}>     // Scrollable container
  <Table.Header headerGroups={...} />          // Column headers with sort controls
  <Table.Body {...getBodyProps()}>             // Virtual body with padding
    <Table.Row key={row.id} row={row} />       // Individual row (handles rowLink)
  </Table.Body>
</Table.Container>
```

---

## MenuCommand (Dropdowns & Selects)

`MenuCommand` replaces the deprecated `Select` and `SelectWithCombobox`. It supports dropdowns, searchable selects, nested menus, and groups.

### Simple Select

```typescript
import { MenuCommand } from 'ui-design-system';
import { useState } from 'react';

export function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton>
          {value || 'Select status'}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth>
        <MenuCommand.List>
          {statuses.map((status) => (
            <MenuCommand.Item
              key={status.id}
              value={status.id}
              onSelect={(selectedId) => {
                onChange(selectedId);
                setOpen(false);
              }}
            >
              {status.label}
              {value === status.id && <Icon icon="tick" className="size-6" />}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
```

### Searchable Select (Combobox)

```typescript
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UserSelect({ users, selectedUserId, onSelect }: UserSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton>
          Select assignee
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth className="mt-2">
        <MenuCommand.Combobox placeholder="Search..." />
        <MenuCommand.List>
          {users.map(({ userId, firstName, lastName }) => (
            <MenuCommand.Item
              key={userId}
              value={userId}
              onSelect={() => {
                onSelect(userId);
                setOpen(false);
              }}
            >
              <span className="inline-flex w-full justify-between">
                <span>{`${firstName} ${lastName}`}</span>
                {userId === selectedUserId && (
                  <Icon icon="tick" className="text-purple-primary size-6" />
                )}
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
```

### MenuCommand Components

| Component | Purpose |
|-----------|---------|
| `MenuCommand.Menu` | Root - manages open/close state. Props: `open`, `onOpenChange`, `hover`, `persistOnSelect` |
| `MenuCommand.Trigger` | Wraps the trigger element |
| `MenuCommand.SelectButton` | Pre-styled button for select-style triggers |
| `MenuCommand.Content` | Dropdown container. Props: `sameWidth`, `align`, `side`, `sideOffset` |
| `MenuCommand.Combobox` | Search input (adds filtering). Props: `placeholder`, `onValueChange` |
| `MenuCommand.List` | Scrollable list container |
| `MenuCommand.Item` | Menu item. Props: `value`, `onSelect`, `disabled` |
| `MenuCommand.SubMenu` | Nested submenu |
| `MenuCommand.Separator` | Visual divider |
| `MenuCommand.Group` | Groups items with optional heading |

---

## Deprecated - Do NOT Use

- `Select` from ui-design-system - use `MenuCommand` instead
- `SelectWithCombobox` from ui-design-system - use `MenuCommand` with `Combobox` instead
