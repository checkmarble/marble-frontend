import clsx from 'clsx';
import type React from 'react';

export function ScenarioValidatioError({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'bg-red-05 text-s flex h-8 items-center justify-center rounded px-2 py-1 font-medium text-red-100',
        className
      )}
    >
      {children}
    </div>
  );
}
