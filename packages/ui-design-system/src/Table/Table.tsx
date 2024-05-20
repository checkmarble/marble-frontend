import {
  flexRender,
  type Header,
  type HeaderGroup,
  type Row,
  type RowData,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { cloneElement, useMemo, useRef } from 'react';
import { Icon } from 'ui-icons';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';

function TableContainer({
  className,
  scrollElementRef,
  ...props
}: React.ComponentProps<'table'> & {
  scrollElementRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <ScrollAreaV2
      ref={scrollElementRef}
      className={clsx(
        'border-grey-10 border-spacing-0 rounded-lg border',
        className,
      )}
      orientation="both"
      type="auto"
    >
      <table
        className="isolate w-full table-fixed border-separate border-spacing-0"
        {...props}
      />
    </ScrollAreaV2>
  );
}

function TableTH<TData extends RowData, TValue>({
  header,
  children,
  className,
  ...props
}: React.ComponentProps<'th'> & { header: Header<TData, TValue> }) {
  return (
    <th
      colSpan={header.colSpan}
      style={{ width: header.getSize() }}
      className={clsx(
        'bg-grey-02 border-grey-10 relative h-12 w-full border-b border-r px-4 last:border-r-0',
        {
          'cursor-pointer select-none': header.column.getCanSort(),
        },
        className,
      )}
      onClick={header.column.getToggleSortingHandler()}
      {...props}
    >
      {children}
    </th>
  );
}

const internalRowLink = '__internal-row-link';

function Header<TData extends RowData>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<TData>[];
}) {
  return (
    <thead className="sticky top-0 z-10">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => {
            const context = header.getContext();
            if (header.id === internalRowLink) {
              return (
                <th
                  colSpan={header.colSpan}
                  key={header.id}
                  className="bg-grey-02 border-grey-10 w-0 border-b"
                ></th>
              );
            }
            return (
              <Table.TH header={header} key={header.id}>
                {header.isPlaceholder ? null : (
                  <div className="text-s text-grey-100 flex flex-row items-center font-semibold">
                    <p className="flex flex-1">
                      {flexRender(header.column.columnDef.header, context)}
                    </p>
                    {{
                      asc: <Icon icon="arrow-2-up" className="size-6" />,
                      desc: <Icon icon="arrow-2-down" className="size-6" />,
                    }[header.column.getIsSorted() as string] ?? null}
                    <div
                      className={clsx(
                        'hover:bg-grey-10 active:bg-grey-50 absolute right-0 h-full w-1 cursor-col-resize touch-none select-none',
                        // Hack to take scroll bar into account
                        index === headerGroup.headers.length - 1 && 'right-2',
                      )}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      onDoubleClick={() => {
                        header.column.resetSize();
                      }}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Table.TH>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

interface TableProps<TData extends RowData> extends TableOptions<TData> {
  /**
   * Transform the row into a link.
   *
   * Be aware you need to use 'relative' class on other interactable cell elements to create a new stacking context and avoid z-index issues.
   *
   * @example
   *  rowLink={(row) => <Link to={`/row/${row.id}`}>{row.name}</Link>}
   *  ...
   *   columnHelper.accessor({
   *     ...
   *     cell: ({ getValue }) => <Checkbox className="relative">{getValue()}</Checkbox>,
   *    }),
   */
  rowLink?: (row: TData) => JSX.Element;
}

function useCoreTable<TData extends RowData>({
  columns,
  rowLink,
  ...options
}: TableProps<TData>) {
  const _columns = useMemo(() => {
    if (!rowLink) return columns;

    columns.unshift({
      id: internalRowLink,
      header: '',
      cell: ({ row }) =>
        cloneElement(rowLink(row.original), {
          className:
            "block size-0 overflow-hidden after:absolute after:inset-0 after:content-['']",
        }),
    });
    return columns;
  }, [columns, rowLink]);

  return useReactTable({ columns: _columns, ...options });
}

export function useVirtualTable<TData extends RowData>(
  options: TableProps<TData>,
) {
  const table = useCoreTable(options);

  const scrollElementRef = useRef<HTMLTableElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollElementRef.current,
    count: rows.length,
    estimateSize: () => 64,
    overscan: 10,
  });

  const { getTotalSize, getVirtualItems } = rowVirtualizer;
  const virtualRows = getVirtualItems();
  const totalSize = getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return {
    table,
    getBodyProps: () => {
      return { paddingTop, paddingBottom };
    },
    getContainerProps: () => {
      return { scrollElementRef };
    },
    isEmpty: rows.length === 0,
    rows: virtualRows.map((virtualRow) => rows[virtualRow.index]),
  };
}

export function useTable<TData extends RowData>(options: TableProps<TData>) {
  const table = useCoreTable(options);

  const scrollElementRef = useRef<HTMLTableElement>(null);

  const { rows } = table.getRowModel();

  return {
    table,
    getBodyProps: () => {
      return { paddingTop: 0, paddingBottom: 0 };
    },
    getContainerProps: () => {
      return { scrollElementRef };
    },
    rows,
  };
}

function Body({
  paddingTop,
  paddingBottom,
  children,
}: {
  paddingTop: number;
  paddingBottom: number;
  children: React.ReactNode;
}) {
  return (
    <tbody>
      {paddingTop > 0 ? (
        <tr>
          <td style={{ height: `${paddingTop}px` }} />
        </tr>
      ) : null}
      {children}
      {paddingBottom > 0 ? (
        <tr>
          <td style={{ height: `${paddingBottom}px` }} />
        </tr>
      ) : null}
    </tbody>
  );
}

function Row<TData extends RowData>({
  row,
  className,
  ...props
}: Omit<React.ComponentProps<'tr'>, 'children'> & { row: Row<TData> }) {
  return (
    // Scale-100 is a hack to bypass relative bug on <tr /> for Safari https://bugs.webkit.org/show_bug.cgi?id=240961
    <tr className={clsx('group relative h-16 scale-100', className)} {...props}>
      {row.getVisibleCells().map((cell) => {
        const context = cell.getContext();
        if (context.column.id === internalRowLink) {
          return (
            <td
              key={cell.id}
              className="border-grey-10 border-b group-last:border-b-0"
            >
              {flexRender(cell.column.columnDef.cell, context)}
            </td>
          );
        }
        return (
          <td
            key={cell.id}
            className="border-grey-10 text-s w-full border-b px-4 font-normal group-last:border-b-0"
          >
            {flexRender(cell.column.columnDef.cell, context)}
          </td>
        );
      })}
    </tr>
  );
}

function DefaultTable<TData extends RowData>({
  table,
  getBodyProps,
  rows,
  getContainerProps,
}: ReturnType<typeof useTable<TData>>) {
  return (
    <Table.Container {...getContainerProps()} className="bg-grey-00 max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
}

export const Table = {
  Container: TableContainer,
  TH: TableTH,
  Header,
  Body,
  Row,
  Default: DefaultTable,
};
