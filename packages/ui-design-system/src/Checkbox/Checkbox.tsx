import { type CheckboxProps, Indicator, Root } from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

export type { CheckedState } from '@radix-ui/react-checkbox';

const checkbox = cva(
  [
    'group flex shrink-0 items-center justify-center rounded-sm border outline-hidden transition-colors',
    // Unchecked
    'border-purple-primary bg-grey-white',
    'hover:bg-purple-background',
    'dark:bg-grey-background dark:hover:border-purple-hover dark:hover:bg-grey-background',
    // Checked
    'enabled:radix-state-checked:bg-purple-primary enabled:radix-state-checked:border-transparent',
    'enabled:radix-state-checked:hover:bg-purple-hover',
    // Indeterminate (some selected)
    'enabled:radix-state-indeterminate:bg-grey-white enabled:radix-state-indeterminate:border-purple-primary',
    'enabled:radix-state-indeterminate:hover:bg-purple-background enabled:radix-state-indeterminate:hover:border-purple-hover',
    'dark:enabled:radix-state-indeterminate:bg-grey-background',
    'dark:enabled:radix-state-indeterminate:hover:bg-grey-background dark:enabled:radix-state-indeterminate:hover:border-purple-hover',
    // Disabled — unchecked
    'disabled:cursor-not-allowed',
    'disabled:radix-state-unchecked:bg-grey-background disabled:radix-state-unchecked:border-grey-border disabled:radix-state-unchecked:border-[0.5px]',
    'dark:disabled:radix-state-unchecked:bg-grey-background dark:disabled:radix-state-unchecked:border-purple-disabled',
    // Disabled — checked / indeterminate
    'disabled:radix-state-checked:bg-grey-disabled disabled:radix-state-checked:border-transparent',
    'dark:disabled:radix-state-checked:bg-purple-disabled',
    'disabled:radix-state-indeterminate:bg-grey-disabled disabled:radix-state-indeterminate:border-transparent',
    'dark:disabled:radix-state-indeterminate:bg-purple-disabled',
  ],
  {
    variants: {
      size: {
        regular: 'size-6',
        small: 'size-4',
      },
    },
    defaultVariants: {
      size: 'regular',
    },
  },
);

export type CheckboxOwnProps = Omit<CheckboxProps, 'asChild'> & {
  size?: 'regular' | 'small';
  stopPropagation?: boolean;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxOwnProps>(function Checkbox(
  { className, checked, size = 'regular', stopPropagation = false, onClick, ...props },
  ref,
) {
  return (
    <Root
      ref={ref}
      id={props.name}
      className={checkbox({ size, className })}
      checked={checked}
      {...props}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onClick?.(e);
      }}
    >
      <Indicator asChild>
        {checked === 'indeterminate' ? (
          <Icon
            icon="check-indeterminate-small"
            className="text-purple-primary group-hover:text-purple-hover group-disabled:text-grey-white"
          />
        ) : (
          <Icon icon="tick" className="text-grey-white" />
        )}
      </Indicator>
    </Root>
  );
});
