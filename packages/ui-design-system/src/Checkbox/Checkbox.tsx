import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

const checkbox = cva(
  [
    'flex size-6 shrink-0 items-center justify-center rounded border outline-none',
    'bg-grey-100 hover:bg-purple-98 enabled:radix-state-checked:border-none enabled:radix-state-checked:bg-purple-65',
    'disabled:bg-grey-90 disabled:border-grey-80 disabled:radix-state-checked:border disabled:radix-state-checked:bg-grey-90 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      color: {
        purple: 'border-purple-82 focus:border-purple-65',
        red: 'focus:border-red-43 border-red-47',
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
      className={checkbox({ color, className: `group ${className}` })}
      checked={checked}
      {...props}
    >
      <Indicator className="size-6" asChild>
        {checked === undefined ? (
          <Icon
            icon="tick"
            className="text-grey-100 group-disabled:text-grey-50"
          />
        ) : checked === true ? (
          <Icon
            icon="tick"
            className="text-grey-100 group-disabled:text-grey-50"
          />
        ) : checked === 'indeterminate' ? (
          <Icon
            icon="check-indeterminate-small"
            className="group-disabled:text-grey-50 text-purple-65"
          />
        ) : null}
      </Indicator>
    </Root>
  );
});
