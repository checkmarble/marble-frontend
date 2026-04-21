import { cn } from 'ui-design-system';

type DataListGridProps = {
  className?: string;
  children: React.ReactNode;
};

export const DataListGrid = ({ className, children }: DataListGridProps) => {
  return <div className={cn('grid grid-cols-[116px_1fr] items-baseline gap-x-3 gap-y-2', className)}>{children}</div>;
};
