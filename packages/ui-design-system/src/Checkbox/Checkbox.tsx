import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { CheckIndeterminateSmall, Tick } from 'ui-icons';

const checkbox = cva(
  'disabled:bg-grey-10 bg-grey-00 hover:bg-purple-05 radix-state-checked:border-none radix-state-checked:bg-purple-100 text-grey-00 flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[24px] outline-none',
  {
    variants: {
      color: {
        purple: 'border-purple-50 focus:border-purple-100',
        red: 'focus:border-red-120 border-red-100',
      },
    },
  },
);

export const Checkbox = forwardRef<
  HTMLButtonElement,
  Omit<CheckboxProps, 'asChild'> & {
    color?: 'purple' | 'red';
  }
>(function Checkbox({ className, color = 'purple', checked, ...props }, ref) {
  return (
    <Root
      ref={ref}
      className={checkbox({ color, className })}
      checked={checked}
      {...props}
    >
      <Indicator>
        {checked === undefined ? (
          <Tick />
        ) : checked === true ? (
          <Tick />
        ) : checked === 'indeterminate' ? (
          <CheckIndeterminateSmall />
        ) : null}
      </Indicator>
    </Root>
  );
});
