import clsx from 'clsx';
import { Root, Indicator, type CheckboxProps } from '@radix-ui/react-checkbox';
import { Tick } from '@marble-front/ui/icons';
import { forwardRef } from 'react';

export const Checkbox = forwardRef<
  HTMLButtonElement,
  Omit<CheckboxProps, 'asChild'> & {
    color?: 'purple' | 'red';
  }
>(({ className, color = 'purple', ...props }, ref) => {
  return (
    <Root
      ref={ref}
      className={clsx(
        'disabled:bg-grey-10 bg-grey-00 hover:bg-purple-05 radix-state-checked:border-none radix-state-checked:bg-purple-100 text-grey-00 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border text-[24px] outline-none',
        {
          'border-purple-50 focus:border-purple-100': color === 'purple',
          'focus:border-red-120 border-red-100': color === 'red',
        },
        className
      )}
      {...props}
    >
      <Indicator>
        <Tick />
      </Indicator>
    </Root>
  );
});

export default Checkbox;
