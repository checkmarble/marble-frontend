import clsx from 'clsx';
import { Root, Indicator, type CheckboxProps } from '@radix-ui/react-checkbox';
import { Tick } from '@marble-front/ui/icons';
import { forwardRef } from 'react';

export const Checkbox = forwardRef<
  HTMLButtonElement,
  Omit<CheckboxProps, 'asChild'>
>(({ className, ...props }, ref) => {
  return (
    <Root
      ref={ref}
      className={clsx(
        'disabled:bg-grey-10 bg-grey-00 hover:bg-purple-05 radix-state-checked:border-none radix-state-checked:bg-purple-100 text-grey-00 flex h-6 w-6 items-center justify-center rounded border border-purple-50 text-[24px] outline-none focus:border-purple-100',
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
