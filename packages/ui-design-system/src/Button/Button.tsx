import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../utils';

export const CtaClassName = cva(
  'text-s flex flex-row items-center justify-center rounded-sm font-semibold outline-hidden border border-solid transition-colors',
  {
    variants: {
      variant: {
        primary: 'text-grey-white focus:border-grey-primary',
        secondary:
          'text-grey-primary bg-surface-card border-grey-border disabled:text-grey-secondary aria-disabled:text-grey-secondary disabled:border-grey-background aria-disabled:border-grey-background disabled:bg-grey-background aria-disabled:bg-grey-background',
        tertiary: 'text-grey-disabled border-transparent',
        ghost: 'text-grey-primary border-transparent',
        outline:
          'hover:bg-purple-background active:bg-purple-background bg-purple-background-light border-purple-primary text-purple-primary disabled:text-grey-secondary aria-disabled:text-grey-secondary disabled:border-grey-background aria-disabled:border-grey-background disabled:bg-grey-background aria-disabled:bg-grey-background focus:border-purple-hover',
        dropdown: 'text-grey-primary border-transparent disabled:text-grey-disabled disabled:bg-transparent',
      },
      color: {
        purple:
          'hover:bg-purple-hover active:bg-purple-hover border-purple-primary bg-purple-primary disabled:bg-purple-disabled disabled:border-purple-disabled aria-disabled:bg-purple-disabled aria-disabled:border-purple-disabled',
        green:
          'hover:bg-green-hover active:bg-green-hover border-green-primary bg-green-primary disabled:bg-green-disabled disabled:border-green-disabled aria-disabled:bg-green-disabled aria-disabled:border-green-disabled',
        red: 'hover:bg-red-hover active:bg-red-hover border-red-primary bg-red-primary disabled:bg-red-disabled aria-disabled:bg-red-disabled',
        grey: 'hover:bg-grey-background active:bg-grey-border focus:border-purple-primary',
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

export const CtaV2ClassName = cva(
  'text-default font-medium w-fit rounded-v2-md inline-flex items-center gap-v2-xs cursor-pointer outline-hidden transition-colors border border-solid disabled:cursor-default',
  {
    variants: {
      variant: {
        primary: '',
        destructive:
          'bg-red-primary border-red-primary text-white enabled:hover:bg-red-hover enabled:hover:border-red-hover disabled:bg-red-disabled disabled:border-red-disabled dark:text-grey-primary dark:disabled:text-grey-secondary',
        secondary:
          'bg-surface-card border-grey-border text-grey-primary enabled:hover:bg-grey-background disabled:bg-grey-background disabled:text-grey-disabled dark:enabled:hover:bg-grey-background-light dark:disabled:bg-grey-background-light',
        warning: '',
        success: '',
      },
      appearance: {
        filled: '',
        stroked: '',
        link: '',
      },
      mode: {
        normal: '',
        icon: 'aspect-square justify-center',
      },
      size: {
        small: 'text-small',
        default: '',
      },
    },
    compoundVariants: [
      // Size + Mode
      {
        size: 'small',
        mode: 'normal',
        class: 'px-v2-sm py-v2-xs',
      },
      {
        size: 'small',
        mode: 'icon',
        class: 'p-v2-xs size-7',
      },
      {
        size: 'default',
        mode: 'normal',
        class: 'p-v2-sm h-10',
      },
      {
        size: 'default',
        mode: 'icon',
        class: 'p-v2-sm size-10',
      },
      // Primary + Filled
      {
        variant: 'primary',
        appearance: 'filled',
        class:
          'bg-purple-primary border-purple-primary text-white enabled:hover:bg-purple-hover enabled:hover:border-purple-hover disabled:bg-purple-disabled disabled:border-purple-disabled dark:text-grey-primary dark:enabled:hover:bg-purple-hover dark:enabled:hover:border-purple-hover dark:disabled:text-grey-secondary',
      },
      // Primary + Stroked
      {
        variant: 'primary',
        appearance: 'stroked',
        class:
          'bg-transparent border-purple-primary text-purple-primary enabled:hover:bg-purple-primary enabled:hover:border-purple-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled dark:border-purple-hover dark:text-purple-hover dark:enabled:hover:bg-purple-primary dark:enabled:hover:border-purple-primary dark:enabled:hover:text-grey-white dark:disabled:bg-transparent dark:disabled:border-purple-disabled dark:disabled:text-purple-disabled',
      },
      // Primary + Link
      {
        variant: 'primary',
        appearance: 'link',
        class:
          'bg-transparent border-transparent p-0 h-auto rounded-none enabled:hover:underline enabled:hover:bg-transparent text-purple-primary enabled:hover:text-purple-hover disabled:text-grey-disabled disabled:no-underline dark:text-purple-hover dark:enabled:hover:text-purple-hover dark:disabled:text-purple-disabled',
      },
      // Secondary + Stroked
      {
        variant: 'secondary',
        appearance: 'stroked',
        class:
          'dark:bg-transparent dark:border-grey-secondary dark:text-grey-secondary dark:enabled:hover:border-grey-primary dark:enabled:hover:text-grey-primary dark:enabled:hover:bg-transparent dark:disabled:border-grey-disabled dark:disabled:text-grey-disabled dark:disabled:bg-transparent',
      },
      // Secondary + Link
      {
        variant: 'secondary',
        appearance: 'link',
        class:
          'bg-transparent border-transparent p-0 h-auto rounded-none enabled:hover:underline enabled:hover:bg-transparent text-grey-secondary enabled:hover:text-grey-primary disabled:text-grey-disabled disabled:no-underline dark:text-grey-secondary dark:enabled:hover:text-grey-primary dark:disabled:text-grey-disabled',
      },
      // Warning + Filled
      {
        variant: 'warning',
        appearance: 'filled',
        class:
          'bg-orange-primary border-orange-primary text-white enabled:hover:bg-orange-hover enabled:hover:border-orange-hover disabled:bg-orange-primary/50 disabled:border-orange-primary/50',
      },
      // Warning + Stroked
      {
        variant: 'warning',
        appearance: 'stroked',
        class:
          'bg-transparent border-orange-primary text-orange-primary enabled:hover:bg-orange-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled',
      },
      // Success + Filled
      {
        variant: 'success',
        appearance: 'filled',
        class:
          'bg-green-primary border-green-primary text-white enabled:hover:bg-green-hover enabled:hover:border-green-hover disabled:bg-green-disabled disabled:border-green-disabled',
      },
      // Success + Stroked
      {
        variant: 'success',
        appearance: 'stroked',
        class:
          'bg-transparent border-green-primary text-green-primary enabled:hover:bg-green-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      mode: 'normal',
      size: 'small',
      appearance: 'filled',
    },
  },
);

export type ButtonV2Props = VariantProps<typeof CtaV2ClassName> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonV2Props>(function Button(
  { variant = 'primary', mode = 'normal', size = 'small', appearance, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(CtaV2ClassName({ variant, mode, size, appearance }), className)}
      {...props}
    />
  );
});
