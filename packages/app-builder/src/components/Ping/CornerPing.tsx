import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

import { Ping } from './Ping';

const corner_ping = cva(
  'border-grey-00 absolute box-content size-[6px] border-2 text-red-100',
  {
    variants: {
      position: {
        'top-right': 'top-0 end-0',
        'top-left': 'top-0 start-0',
        'bottom-right': 'bottom-0 end-0',
        'bottom-left': 'bottom-0 start-0',
      },
    },
  },
);

export function CornerPing({
  children,
  className,
  position,
}: {
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof corner_ping>) {
  return (
    <span className={clsx('relative', className)}>
      {children}
      <Ping aria-hidden="true" className={corner_ping({ position })} />
    </span>
  );
}
