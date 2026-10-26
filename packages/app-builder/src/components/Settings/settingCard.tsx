import { RowData } from '@tanstack/react-table';
import { cn, Table, Typo, useTable } from 'ui-design-system';

export function SettingCard<TData extends RowData>({
  title,
  table,
  addButton,
  additionalButtons,
  onRowClick,
  isRowClickable,
  children,
}: {
  title?: string | React.ReactNode;
  table?: ReturnType<typeof useTable<TData>>;
  addButton?: React.ReactNode;
  additionalButtons?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  isRowClickable?: (row: TData) => boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sm">
      {typeof title === 'string' ? <Typo variant="title2">{title}</Typo> : (title ?? null)}
      {children}
      {table ? (
        <Table.Container {...table.getContainerProps()} className="bg-surface-card max-h-96 [&_th]:border-r-0">
          <Table.Header
            headerGroups={table.table.getHeaderGroups()}
            actions={
              <>
                {additionalButtons}
                {addButton}
              </>
            }
          />
          <Table.Body {...table.getBodyProps()}>
            {table.rows.map((row) => {
              const handleClick =
                onRowClick && (isRowClickable?.(row.original) ?? true) ? () => onRowClick(row.original) : undefined;

              return (
                <Table.Row
                  key={row.id}
                  className={cn('hover:bg-purple-background-light group', handleClick && 'cursor-pointer')}
                  row={row}
                  tabIndex={handleClick ? 0 : undefined}
                  onClick={handleClick}
                  onKeyDown={
                    handleClick
                      ? (e) => {
                          if (e.key === 'Enter' && e.target === e.currentTarget) handleClick();
                        }
                      : undefined
                  }
                />
              );
            })}
          </Table.Body>
        </Table.Container>
      ) : null}
    </div>
  );
}
