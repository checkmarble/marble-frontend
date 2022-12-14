import clsx from 'clsx';
import { forwardRef, RefObject, useRef } from 'react';

import {
  Header,
  HeaderGroup,
  Table as TableT,
  RowData,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Arrow2Down, Arrow2Up } from '@marble-front/ui/icons';

type TableContainerProps = Pick<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children' | 'className'
> & { table: TableT<any> };

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ table, children, className }, ref) => {
    return (
      <div className="border-grey-10 w-fit overflow-hidden rounded-lg border">
        <div ref={ref} className={clsx('h-96 overflow-auto', className)}>
          <table
            className="w-full table-fixed border-separate border-spacing-0"
            style={{ width: table.getTotalSize() }}
          >
            {children}
          </table>
        </div>
      </div>
    );
  }
);

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
      key={header.id}
      colSpan={header.colSpan}
      style={{ width: header.getSize() }}
      className={clsx(
        'bg-grey-02 border-grey-10 relative h-12 w-full border-b border-r pl-4 pr-4 last:border-r-0',
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

function DefaultHeader<TData extends RowData>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<TData>[];
}) {
  return (
    <Table.THead>
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <Table.TH header={header}>
                {header.isPlaceholder ? null : (
                  <div className="text-text-s-semibold-cta text-grey-100 flex flex-row items-center">
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
                      className="hover:bg-grey-10 active:bg-grey-50 absolute right-0 h-full w-1 cursor-col-resize touch-none select-none"
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
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

function DefaultBody<TData extends RowData>({
  table,
  tableContainerRef,
}: {
  table: TableT<TData>;
  tableContainerRef: RefObject<HTMLDivElement>;
}) {
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

  return (
    <tbody>
      {paddingTop > 0 && (
        <tr>
          <td style={{ height: `${paddingTop}px` }} />
        </tr>
      )}
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <tr key={row.id} className="group h-16">
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  className="border-grey-10 w-full border-b pl-4 pr-4 group-last:border-b-0"
                >
                  <p className="line-clamp-2 text-text-s-regular">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </p>
                </td>
              );
            })}
          </tr>
        );
      })}
      {paddingBottom > 0 && (
        <tr>
          <td style={{ height: `${paddingBottom}px` }} />
        </tr>
      )}
    </tbody>
  );
}

function DefaultTable<TData extends RowData>({
  table,
}: {
  table: TableT<TData>;
}) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Table.Container ref={tableContainerRef} table={table}>
      <Table.DefaultHeader headerGroups={table.getHeaderGroups()} />
      <Table.DefaultBody table={table} tableContainerRef={tableContainerRef} />
    </Table.Container>
  );
}

export const Table = {
  Container: TableContainer,
  THead: TableTHead,
  TH: TableTH,
  DefaultHeader,
  DefaultBody,
  Default: DefaultTable,
};
