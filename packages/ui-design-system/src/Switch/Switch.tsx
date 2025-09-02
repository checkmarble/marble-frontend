import clsx from 'clsx';
import { Switch as RadixSwitch } from 'radix-ui';
import { forwardRef } from 'react';

export const Switch = forwardRef<
  HTMLButtonElement,
  RadixSwitch.SwitchProps & { className?: string }
>(function Switch({ className, ...props }, ref) {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={clsx(
        'bg-grey-90 radix-state-checked:bg-purple-65 focus:border-purple-65 relative h-6 w-10 rounded-full outline-hidden transition-all',
        'focus:ring-purple-65 focus:ring-2',
        'disabled:bg-grey-90',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={clsx(
          'bg-grey-100 block size-4 rounded-full transition-transform',
          'radix-state-checked:rtl:-translate-x-5 rtl:-translate-x-1',
          'radix-state-checked:ltr:translate-x-5 ltr:translate-x-1',
        )}
      />
    </RadixSwitch.Root>
  );
});
