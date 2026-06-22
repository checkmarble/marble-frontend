import clsx from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

export function SimpleFilter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className="bg-purple-background-light flex h-10 flex-row items-center rounded-sm">
      <div
        className={clsx('text-purple-primary flex h-full flex-row items-center gap-xs rounded-sm px-xs', className)}
        {...props}
      />
    </div>
  );
}
