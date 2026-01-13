import { cn } from 'ui-design-system';

type TableProps = {
  className?: string;
  children: React.ReactNode;
};

const Table = ({ className, children }: TableProps) => {
  return <div className={cn('grid border border-grey-border rounded-lg bg-surface-card', className)}>{children}</div>;
};

type TableRowProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const TableRow = ({ className, children, ...props }: TableRowProps) => {
  return (
    <div className={cn('group/row grid grid-cols-subgrid col-span-full items-center', className)} {...props}>
      {children}
    </div>
  );
};

type TableCellProps = {
  className?: string;
  children: React.ReactNode;
};

const TableCell = ({ className, children }: TableCellProps) => {
  return <div className={cn('p-v2-md flex gap-v2-sm items-center', className)}>{children}</div>;
};

const GridTable = {
  Table: Table,
  Row: TableRow,
  Cell: TableCell,
};

export default GridTable;
