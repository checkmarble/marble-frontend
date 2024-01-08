import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

const checkbox = cva(
  'disabled:bg-grey-10 bg-grey-00 hover:bg-purple-05 radix-state-checked:border-none radix-state-checked:bg-purple-100 flex size-6 shrink-0 items-center justify-center rounded border outline-none',
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
      <Indicator className="size-6" asChild>
        {checked === undefined ? (
          <Icon icon="tick" className="text-grey-00" />
        ) : checked === true ? (
          <Icon icon="tick" className="text-grey-00" />
        ) : checked === 'indeterminate' ? (
          <Icon icon="check-indeterminate-small" className="text-purple-100" />
        ) : null}
      </Indicator>
    </Root>
  );
});
