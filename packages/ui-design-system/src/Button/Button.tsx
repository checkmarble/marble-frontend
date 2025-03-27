import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../utils';

export const CtaClassName = cva(
  'text-s flex flex-row items-center justify-center rounded font-semibold outline-none border border-solid transition-colors',
  {
    variants: {
      variant: {
        primary: 'text-grey-100 focus:border-grey-00',
        secondary:
          'text-grey-00 bg-grey-100 border-grey-90 disabled:text-grey-50 aria-disabled:text-grey-50 disabled:border-grey-95 aria-disabled:border-grey-95 disabled:bg-grey-95 aria-disabled:bg-grey-95',
        tertiary: 'text-grey-80 border-transparent',
        outline:
          'hover:bg-purple-96 active:bg-purple-96 bg-purple-98 border-purple-65 text-purple-65 disabled:text-grey-50 aria-disabled:text-grey-50 disabled:border-grey-95 aria-disabled:border-grey-95 disabled:bg-grey-95 aria-disabled:bg-grey-95 focus:border-purple-60',
        dropdown: 'text-grey-00 border-transparent disabled:text-grey-80 disabled:bg-transparent',
      },
      color: {
        purple:
          'hover:bg-purple-60 active:bg-purple-60 border-purple-65 bg-purple-65 disabled:bg-purple-82 disabled:border-purple-82 aria-disabled:bg-purple-82 aria-disabled:border-purple-82',
        green:
          'hover:bg-green-34 active:bg-green-34 border-green-38 bg-green-38 disabled:bg-green-68 disabled:border-green-68 aria-disabled:bg-green-68 aria-disabled:border-green-68',
        red: 'hover:bg-red-43 active:bg-red-43 border-red-47 bg-red-47 disabled:bg-red-74 aria-disabled:bg-red-74',
        grey: 'hover:bg-grey-95 active:bg-grey-90 focus:border-purple-65',
      },
      size: {
        default: 'px-4 py-2 gap-1',
        small: 'px-1.5 h-7 gap-0.5 text-xs w-fit',
        icon: 'size-6 gap-1',
        dropdown: 'p-2 gap-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type ButtonProps = VariantProps<typeof CtaClassName> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    color = variant === 'primary' ? 'purple' : 'grey',
    size = 'default',
    className,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(CtaClassName({ variant, color, size }), className)}
      {...props}
    />
  );
});
