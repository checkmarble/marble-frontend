import { Root, type SwitchProps, Thumb } from '@radix-ui/react-switch';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const Switch = forwardRef<HTMLButtonElement, SwitchProps & { className?: string }>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <Root
      ref={ref}
      className={clsx(
        // Light mode
        'bg-grey-border radix-state-checked:bg-purple-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Dark mode
        'dark:bg-grey-secondary dark:radix-state-checked:bg-purple-primary',
        // Focus & layout
        'focus:border-purple-primary focus:ring-purple-primary focus:ring-2',
        'relative h-6 w-10 rounded-full outline-hidden transition-all',
        className,
      )}
      {...props}
    >
      <Thumb
        className={clsx(
          'bg-grey-white block size-4 rounded-full transition-transform',
          'dark:bg-grey-primary dark:radix-state-checked:bg-grey-white',
          'radix-state-checked:rtl:-translate-x-5 rtl:-translate-x-1',
          'radix-state-checked:ltr:translate-x-5 ltr:translate-x-1',
        )}
      />
    </Root>
  );
});
