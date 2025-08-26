import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../utils';

export const CtaClassName = cva(
  'text-s flex flex-row items-center justify-center rounded-sm font-semibold outline-hidden border border-solid transition-colors',
  {
    variants: {
      variant: {
        primary: 'text-grey-100 focus:border-grey-00',
        secondary:
          'text-grey-00 bg-grey-100 border-grey-90 disabled:text-grey-50 aria-disabled:text-grey-50 disabled:border-grey-95 aria-disabled:border-grey-95 disabled:bg-grey-95 aria-disabled:bg-grey-95',
        tertiary: 'text-grey-80 border-transparent',
        ghost: 'text-grey-00 border-transparent',
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
        medium: 'px-2 py-1.5 gap-1',
        xs: 'h-6 px-1 gap-[3px] text-xs w-fit font-medium',
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

// @deprecated use the new ButtonV2 instead
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

export const CtaV2ClassName = cva(
  'text-default font-medium w-fit rounded-v2-md inline-flex items-center gap-v2-xs cursor-pointer outline-hidden transition-colors border border-solid disabled:cursor-default',
  {
    variants: {
      variant: {
        primary:
          'bg-purple-65 border-purple-65 text-white hover:bg-purple-60 hover:border-purple-60 disabled:bg-purple-82 disabled:border-purple-82',
        destructive:
          'bg-red-47 border-red-47 text-white hover:bg-red-43 hover:border-red-43 disabled:bg-red-74',
        secondary:
          'bg-white border-grey-border text-grey-00 hover:bg-grey-background disabled:bg-grey-background disabled:text-grey-80',
      },
      mode: {
        normal: 'px-v2-sm py-v2-xs',
        icon: 'aspect-square p-v2-xs size-7 justify-center',
      },
    },
    defaultVariants: {
      variant: 'primary',
      mode: 'normal',
    },
  },
);

export type ButtonV2Props = VariantProps<typeof CtaV2ClassName> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const ButtonV2 = forwardRef<HTMLButtonElement, ButtonV2Props>(function ButtonV2(
  { variant = 'primary', mode = 'normal', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(CtaV2ClassName({ variant, mode }), className)}
      {...props}
    />
  );
});
