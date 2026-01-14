import { cn } from 'ui-design-system';

type SquareTagProps = {
  children: React.ReactNode;
  className?: string;
};

export const SquareTag = ({ children, className }: SquareTagProps) => {
  return (
    <span
      className={cn(
        'text-small border border-grey-border rounded-v2-s h-6 px-v2-xs text-grey-primary inline-flex items-center bg-surface-card',
        className,
      )}
    >
      {children}
    </span>
  );
};
