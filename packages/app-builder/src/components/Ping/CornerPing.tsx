import clsx from 'clsx';

import { Ping } from './Ping';

const style = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
} as const;

export function CornerPing({
  children,
  className,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  variant: keyof typeof style;
}) {
  return (
    <span className={clsx('relative', className)}>
      {children}
      <Ping
        aria-hidden="true"
        className={clsx(
          'border-grey-00 absolute box-content h-[6px] w-[6px] border-2 text-red-100',
          style[variant]
        )}
      />
    </span>
  );
}

export function withCornerPing({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: keyof typeof style;
}) {
  return function CornerPingWrapper({ className }: { className?: string }) {
    return (
      <CornerPing className={className} variant={variant}>
        {children}
      </CornerPing>
    );
  };
}
