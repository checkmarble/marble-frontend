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
import { cloneElement, createContext, useContext, useMemo, useRef } from 'react';
import { Icon } from 'ui-icons';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';

const WithRowLinkContext = createContext(false);

function TableContainer({
  className,
  scrollElementRef,
  withRowLink,
  ...props
}: React.ComponentProps<'table'> & {
  scrollElementRef: React.RefObject<HTMLDivElement>;
  withRowLink: boolean;
}) {
  return (
    <ScrollAreaV2
      ref={scrollElementRef}
      className={clsx('border-grey-90 border-spacing-0 rounded-lg border', className)}
      orientation="both"
      type="auto"
    >
      <WithRowLinkContext.Provider value={withRowLink}>
        <table className="isolate w-full table-fixed border-separate border-spacing-0" {...props} />
      </WithRowLinkContext.Provider>
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
        'border-grey-90 bg-grey-100 relative h-12 w-full border-b border-r px-4 last:border-r-0',
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

// biome-ignore lint/suspicious/noRedeclare: <TBD>
function Header<TData extends RowData>({ headerGroups }: { headerGroups: HeaderGroup<TData>[] }) {
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
                  className="bg-grey-100 border-grey-90 w-0 border-b"
                ></th>
              );
            }
            return (
              <Table.TH header={header} key={header.id}>
                {header.isPlaceholder ? null : (
                  <div className="text-s text-grey-00 flex flex-row items-center font-semibold">
                    <p className="flex flex-1">
                      {flexRender(header.column.columnDef.header, context)}
                    </p>
                    {{
                      asc: <Icon icon="arrow-2-up" className="size-6" />,
                      desc: <Icon icon="arrow-2-down" className="size-6" />,
                    }[header.column.getIsSorted() as string] ?? null}
                    {header.column.getCanResize() ? (
                      <div
                        className={clsx(
                          'hover:bg-grey-90 active:bg-grey-50 absolute right-0 h-full w-1 cursor-col-resize touch-none select-none',
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
                    ) : null}
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
   * Transform the row into a link :
   * - the link will be placed in a dedicated first column with width = 0.
   * - the row will be clickable using the [redundant click event](https://inclusive-components.design/cards/#theredundantclickevent) pattern
   * - the row will be highlighted on hover / focus-within (= when the link is focused).
   */
  rowLink?: (row: TData) => JSX.Element;
}

function useCoreTable<TData extends RowData>({ columns, rowLink, ...options }: TableProps<TData>) {
  const _columns = useMemo(() => {
    if (!rowLink) return columns;

    columns.unshift({
      id: internalRowLink,
      header: '',
      cell: ({ row }) =>
        cloneElement(rowLink(row.original), {
          'data-column-id': internalRowLink,
        }),
    });
    return columns;
  }, [columns, rowLink]);

  return useReactTable({ columns: _columns, ...options });
}

export function useVirtualTable<TData extends RowData>(options: TableProps<TData>) {
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
    virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

  return {
    table,
    getBodyProps: () => {
      return { paddingTop, paddingBottom };
    },
    getContainerProps: () => {
      return { scrollElementRef, withRowLink: options?.rowLink !== undefined };
    },
    isEmpty: rows.length === 0,
    rows: virtualRows.map(
      (virtualRow) =>
        // Safe to cast as virtualRows is built from rows
        rows[virtualRow.index] as Row<TData>,
    ),
    scrollToTop: () => {
      rowVirtualizer.scrollToIndex(0);
    },
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
      return { scrollElementRef, withRowLink: options?.rowLink !== undefined };
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

// biome-ignore lint/suspicious/noRedeclare: <TBD>
function Row<TData extends RowData>({
  row,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<'tr'>, 'children'> & { row: Row<TData> }) {
  const withRowLink = useContext(WithRowLinkContext);

  return (
    <tr
      onClick={(e) => {
        if (withRowLink) {
          const rowLink = e.currentTarget.querySelector('[data-column-id="__internal-row-link"]');
          if (rowLink && rowLink !== e.target && rowLink instanceof HTMLAnchorElement) {
            // Use dispatchEvent rather than click() to keep base event properties (ie: meta key pressed)
            rowLink.dispatchEvent(new MouseEvent(e.type, e.nativeEvent));
          }
        }
        onClick?.(e);
      }}
      className={clsx(
        'even:bg-grey-98 h-12',
        withRowLink && 'hover:bg-purple-98 focus-within:bg-purple-98 cursor-pointer group/row-link',
        className,
      )}
      {...props}
    >
      {row.getVisibleCells().map((cell) => {
        const context = cell.getContext();
        if (context.column.id === internalRowLink) {
          return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, context)}</td>;
        }
        return (
          <td key={cell.id} className="text-s w-full truncate px-4 font-normal">
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
    <Table.Container {...getContainerProps()} className="bg-grey-100 max-h-96">
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
