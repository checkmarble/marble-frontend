import { Root, type SwitchProps, Thumb } from '@radix-ui/react-switch';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const Switch = forwardRef<
  HTMLButtonElement,
  SwitchProps & { className?: string }
>(function Switch({ className, ...props }, ref) {
  return (
    <Root
      ref={ref}
      className={clsx(
        'bg-grey-90 radix-state-checked:bg-purple-65 focus:border-purple-65 relative h-6 w-10 rounded-full outline-none transition-all',
        'focus:ring-purple-65 focus:ring-2',
        'disabled:bg-grey-90',
        className,
      )}
      {...props}
    >
      <Thumb
        className={clsx(
          'bg-grey-100 block size-4 rounded-full transition-transform',
          'rtl:radix-state-checked:-translate-x-5 rtl:-translate-x-1',
          'ltr:radix-state-checked:translate-x-5 ltr:translate-x-1',
        )}
      />
    </Root>
  );
});
