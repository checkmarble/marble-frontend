import { ReactNode } from 'react';
import { cn } from 'ui-design-system';

type CapsuleProps = { children: ReactNode; className?: string };

export const Capsule = ({ children, className }: CapsuleProps) => {
  return (
    <div className={cn('rounded-full px-v2-sm py-v2-xs text-small bg-grey-background', className)}>{children}</div>
  );
};
