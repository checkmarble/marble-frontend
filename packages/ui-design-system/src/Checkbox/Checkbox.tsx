import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

export type { CheckedState } from '@radix-ui/react-checkbox';

const checkbox = cva(
  [
    'flex shrink-0 items-center justify-center rounded-sm border outline-hidden',
    'bg-surface-card hover:bg-purple-background-light group-hover/checkbox-parent:bg-purple-background-light enabled:radix-state-checked:border-none enabled:radix-state-checked:bg-purple-primary dark:hover:bg-purple-primary/20 dark:group-hover/checkbox-parent:bg-purple-primary/20',
    'disabled:bg-grey-border disabled:border-grey-disabled disabled:radix-state-checked:border disabled:radix-state-checked:bg-grey-border disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        small: 'size-4',
        default: 'size-6',
      },
      color: {
        purple: 'border-purple-disabled focus:border-purple-primary',
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
          <Icon icon="tick" className="text-grey-white group-disabled:text-grey-placeholder dark:text-[#FFFFFF]" />
        ) : checked === true ? (
          <Icon icon="tick" className="text-grey-white group-disabled:text-grey-placeholder dark:text-[#FFFFFF]" />
        ) : checked === 'indeterminate' ? (
          <Icon
            icon="check-indeterminate-small"
            className="group-disabled:text-grey-placeholder text-purple-primary dark:text-[#FFFFFF]"
          />
        ) : null}
      </Indicator>
    </Root>
  );
});
