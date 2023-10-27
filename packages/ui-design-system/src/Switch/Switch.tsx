import { Root, type SwitchProps, Thumb } from '@radix-ui/react-switch';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const Switch = forwardRef<
  HTMLButtonElement,
  SwitchProps & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <Root
      ref={ref}
      className={clsx(
        'bg-grey-10 radix-state-checked:bg-purple-100 relative h-6 w-10 rounded-full outline-none transition-all focus:border-purple-100',
        'disabled:bg-grey-10',
        className
      )}
      {...props}
    >
      <Thumb className="bg-grey-00 radix-state-checked:translate-x-5 block h-4 w-4 translate-x-1 rounded-full transition-transform" />
    </Root>
  );
});

export default Switch;
