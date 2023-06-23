import { Lightbulb } from '@marble-front/ui/icons';
import clsx from 'clsx';
import React from 'react';

export function Callout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <div
      className={clsx(
        'bg-grey-02 text-s text-grey-100 flex flex-row items-center gap-2 rounded border-l-2 border-l-purple-100 p-2 font-normal',
        className
      )}
    >
      <Lightbulb height="24px" width="24px" className="flex-shrink-0" />
      {children}
    </div>
  );
}
