import clsx from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

export function SimpleFilter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className="bg-purple-98 flex h-10 flex-row items-center rounded">
      <div
        className={clsx(
          'text-purple-65 flex h-full flex-row items-center gap-1 rounded px-2',
          className,
        )}
        {...props}
      />
    </div>
  );
}
