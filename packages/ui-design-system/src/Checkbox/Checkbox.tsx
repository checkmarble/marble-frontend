import { cva } from 'class-variance-authority';
import { Checkbox as RadixCheckbox } from 'radix-ui';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';
export type CheckedState = RadixCheckbox.CheckedState;
const checkbox = cva(
  [
    'flex shrink-0 items-center justify-center rounded-sm border outline-hidden',
    'bg-grey-100 hover:bg-purple-98 enabled:radix-state-checked:border-none enabled:radix-state-checked:bg-purple-65',
    'disabled:bg-grey-90 disabled:border-grey-80 disabled:radix-state-checked:border disabled:radix-state-checked:bg-grey-90 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        small: 'size-4',
        default: 'size-6',
      },
      color: {
        purple: 'border-purple-82 focus:border-purple-65',
        red: 'focus:border-red-43 border-red-47',
      },
      circle: {
        true: 'rounded-full',
        false: null,
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const Checkbox = forwardRef<
  HTMLButtonElement,
  Omit<RadixCheckbox.CheckboxProps, 'asChild'> & {
    color?: 'purple' | 'red';
    circle?: boolean;
    size?: 'small' | 'default';
  }
>(function Checkbox(
  { className, color = 'purple', circle, checked, size = 'default', ...props },
  ref,
) {
  return (
    <RadixCheckbox.Root
      ref={ref}
      id={props.name}
      className={checkbox({ color, circle, size, className: `group ${className}` })}
      checked={checked}
      {...props}
    >
      <RadixCheckbox.Indicator asChild>
        {checked === undefined ? (
          <Icon icon="tick" className="text-grey-100 group-disabled:text-grey-50" />
        ) : checked === true ? (
          <Icon icon="tick" className="text-grey-100 group-disabled:text-grey-50" />
        ) : checked === 'indeterminate' ? (
          <Icon
            icon="check-indeterminate-small"
            className="group-disabled:text-grey-50 text-purple-65"
          />
        ) : null}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
});
