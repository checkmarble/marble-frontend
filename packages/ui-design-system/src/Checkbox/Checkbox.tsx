import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

export type { CheckedState } from '@radix-ui/react-checkbox';

const checkbox = cva(
  [
    'flex shrink-0 items-center justify-center rounded-sm border outline-hidden',
    // Light mode
    'bg-grey-white hover:bg-purple-background-light group-hover/checkbox-parent:bg-purple-background-light',
    'enabled:radix-state-checked:border-none enabled:radix-state-checked:bg-purple-primary enabled:radix-state-checked:hover:bg-purple-hover',
    'disabled:border-transparent disabled:bg-grey-disabled disabled:radix-state-unchecked:bg-grey-background disabled:radix-state-unchecked:border-grey-border disabled:cursor-not-allowed',
    // Dark mode
    'dark:bg-grey-background dark:hover:bg-grey-background-light dark:group-hover/checkbox-parent:bg-grey-background-light',
    'dark:enabled:radix-state-checked:bg-purple-primary dark:enabled:radix-state-checked:hover:bg-purple-hover',
    'dark:disabled:bg-grey-background dark:disabled:border-purple-disabled dark:disabled:radix-state-checked:bg-purple-disabled',
  ],
  {
    variants: {
      size: {
        small: 'size-4',
        default: 'size-6',
      },
      color: {
        purple: 'border-purple-primary focus:border-purple-primary dark:border-purple-primary',
        red: 'focus:border-red-hover border-red-primary',
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
  Omit<CheckboxProps, 'asChild'> & {
    color?: 'purple' | 'red';
    circle?: boolean;
    size?: 'small' | 'default';
  }
>(function Checkbox({ className, color = 'purple', circle, checked, size = 'default', ...props }, ref) {
  return (
    <Root
      ref={ref}
      id={props.name}
      className={checkbox({ color, circle, size, className: `group ${className}` })}
      checked={checked}
      {...props}
    >
      <Indicator asChild>
        {checked === undefined ? (
          <Icon icon="tick" className="text-grey-white dark:group-disabled:text-purple-primary" />
        ) : checked === true ? (
          <Icon icon="tick" className="text-grey-white dark:group-disabled:text-purple-primary" />
        ) : checked === 'indeterminate' ? (
          <Icon
            icon="check-indeterminate-small"
            className="text-purple-primary group-disabled:text-grey-white dark:group-disabled:text-purple-primary"
          />
        ) : null}
      </Indicator>
    </Root>
  );
});
