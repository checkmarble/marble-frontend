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
import { useRef } from 'react';
import { Arrow2Down, Arrow2Up } from 'ui-icons';

import { ScrollArea } from '../ScrollArea/ScrollArea';

interface TableContainerProps
  extends Pick<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    'children' | 'className'
  > {
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function TableContainer({
  tableContainerRef,
  children,
  className,
}: TableContainerProps) {
  return (
    <ScrollArea.Root className="border-grey-10 overflow-hidden rounded-lg border">
      <ScrollArea.Viewport
        ref={tableContainerRef}
        className={clsx('flex h-full overflow-auto', className)}
      >
        <table className="w-full table-fixed border-separate border-spacing-0">
          {children}
        </table>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}

function TableTHead({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTableSectionElement>,
  HTMLTableSectionElement
>) {
  return <thead className={clsx('sticky top-0', className)} {...props} />;
}

function TableTH<TData extends RowData, TValue>({
  header,
  children,
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  HTMLTableCellElement
> & { header: Header<TData, TValue> }) {
  return (
    <th
      colSpan={header.colSpan}
      style={{ width: header.getSize() }}
      className={clsx(
        'bg-grey-02 border-grey-10 relative h-12 w-full border-b border-r px-4 last:border-r-0',
        {
          'cursor-pointer select-none': header.column.getCanSort(),
        },
        className
      )}
      onClick={header.column.getToggleSortingHandler()}
      {...props}
    >
      {children}
    </th>
  );
}

function Header<TData extends RowData>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<TData>[];
}) {
  return (
    <Table.THead>
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => {
            return (
              <Table.TH header={header} key={header.id}>
                {header.isPlaceholder ? null : (
                  <div className="text-s text-grey-100 flex flex-row items-center font-semibold">
                    <p className="flex flex-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </p>
                    {{
                      asc: <Arrow2Up width="24px" height="24px" />,
                      desc: <Arrow2Down width="24px" height="24px" />,
                    }[header.column.getIsSorted() as string] ?? null}
                    <div
                      className={clsx(
                        'hover:bg-grey-10 active:bg-grey-50 absolute right-0 h-full w-1 cursor-col-resize touch-none select-none',
                        // Hack to take scroll bar into account
                        index === headerGroup.headers.length - 1 && 'right-2'
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
    </Table.THead>
  );
}

export function useVirtualTable<TData extends RowData>(
  options: TableOptions<TData>
) {
  const table = useReactTable(options);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
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
      return { table, tableContainerRef };
    },
    rows: virtualRows.map((virtualRow) => rows[virtualRow.index]),
  };
}

export function useTable<TData extends RowData>(options: TableOptions<TData>) {
  const table = useReactTable(options);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  return {
    table,
    getBodyProps: () => {
      return { paddingTop: 0, paddingBottom: 0 };
    },
    getContainerProps: () => {
      return { table, tableContainerRef };
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
      {paddingTop > 0 && (
        <tr>
          <td style={{ height: `${paddingTop}px` }} />
        </tr>
      )}
      {children}
      {paddingBottom > 0 && (
        <tr>
          <td style={{ height: `${paddingBottom}px` }} />
        </tr>
      )}
    </tbody>
  );
}

function Row<TData extends RowData>({
  row,
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTableRowElement>,
  HTMLTableRowElement
> & { row: Row<TData> }) {
  return (
    <tr className={clsx('group h-16', className)} {...props}>
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            className="border-grey-10 text-s w-full border-b px-4 font-normal group-last:border-b-0"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
}: ReturnType<typeof useVirtualTable<TData>>) {
  return (
    <Table.Container {...getContainerProps()}>
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
  THead: TableTHead,
  TH: TableTH,
  Header,
  Body,
  Row,
  Default: DefaultTable,
};
