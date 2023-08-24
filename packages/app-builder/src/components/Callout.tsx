import { Lightbulb } from '@ui-icons';
import clsx from 'clsx';

export const variants = ['info', 'error'] as const;

export function Callout({
  children,
  className,
  variant = 'info',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: (typeof variants)[number];
}) {
  if (!children) return null;

  return (
    <div
      className={clsx(
        'bg-grey-02 text-s text-grey-100 flex flex-row items-center gap-2 rounded p-2 font-normal',
        {
          'border-l-2 border-l-purple-100': variant === 'info',
          'border-l-2 border-l-red-100': variant === 'error',
        },
        className
      )}
    >
      <Lightbulb height="24px" width="24px" className="flex-shrink-0" />
      {children}
    </div>
  );
}
