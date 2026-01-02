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
          'text-grey-primary bg-surface-card border-grey-border disabled:text-grey-placeholder aria-disabled:text-grey-placeholder disabled:border-grey-background aria-disabled:border-grey-background disabled:bg-grey-background aria-disabled:bg-grey-background',
        tertiary: 'text-grey-disabled border-transparent',
        ghost: 'text-grey-primary border-transparent',
        outline:
          'hover:bg-purple-background active:bg-purple-background bg-purple-background-light border-purple-primary text-purple-primary disabled:text-grey-placeholder aria-disabled:text-grey-placeholder disabled:border-grey-background aria-disabled:border-grey-background disabled:bg-grey-background aria-disabled:bg-grey-background focus:border-purple-hover',
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

export type ButtonProps = VariantProps<typeof CtaClassName> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

// @deprecated use the new ButtonV2 instead
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', color = variant === 'primary' ? 'purple' : 'grey', size = 'default', className, ...props },
  ref,
) {
  return (
    <button ref={ref} type="button" className={cn(CtaClassName({ variant, color, size }), className)} {...props} />
  );
});

export const CtaV2ClassName = cva(
  'text-default font-medium w-fit rounded-v2-md inline-flex items-center gap-v2-xs cursor-pointer outline-hidden transition-colors border border-solid disabled:cursor-default',
  {
    variants: {
      variant: {
        primary: '',
        destructive:
          'bg-red-primary border-red-primary text-white hover:bg-red-hover hover:border-red-hover disabled:bg-red-disabled disabled:border-red-disabled dark:text-grey-primary dark:disabled:text-grey-secondary',
        secondary:
          'bg-surface-card border-grey-border text-grey-primary hover:bg-grey-background disabled:bg-grey-background disabled:text-grey-disabled dark:hover:bg-grey-background-light dark:disabled:bg-grey-background-light',
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
        small: '',
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
          'bg-purple-primary border-purple-primary text-white hover:bg-purple-hover hover:border-purple-hover disabled:bg-purple-disabled disabled:border-purple-disabled dark:text-grey-primary dark:hover:bg-purple-primary-outline dark:hover:border-purple-primary-outline dark:disabled:text-grey-secondary',
      },
      // Primary + Stroked
      {
        variant: 'primary',
        appearance: 'stroked',
        class:
          'bg-transparent border-purple-primary text-purple-primary hover:bg-purple-background hover:border-purple-hover disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled dark:border-purple-primary-outline dark:text-purple-primary-outline dark:hover:bg-transparent dark:hover:border-purple-hover dark:hover:text-purple-hover dark:disabled:bg-transparent dark:disabled:border-purple-disabled dark:disabled:text-purple-disabled',
      },
      // Primary + Link
      {
        variant: 'primary',
        appearance: 'link',
        class:
          'bg-transparent border-transparent p-0 h-auto rounded-none hover:underline hover:bg-transparent text-purple-primary hover:text-purple-hover disabled:text-grey-disabled dark:text-purple-primary-outline dark:hover:text-purple-hover dark:disabled:text-purple-disabled',
      },
      // Secondary + Stroked
      {
        variant: 'secondary',
        appearance: 'stroked',
        class:
          'dark:bg-transparent dark:border-grey-secondary dark:text-grey-secondary dark:hover:border-grey-primary dark:hover:text-grey-primary dark:hover:bg-transparent dark:disabled:border-grey-disabled dark:disabled:text-grey-disabled dark:disabled:bg-transparent',
      },
      // Secondary + Link
      {
        variant: 'secondary',
        appearance: 'link',
        class:
          'bg-transparent border-transparent p-0 h-auto rounded-none hover:underline hover:bg-transparent text-grey-secondary hover:text-grey-primary disabled:text-grey-disabled dark:text-grey-secondary dark:hover:text-grey-primary dark:disabled:text-grey-disabled',
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

export const ButtonV2 = forwardRef<HTMLButtonElement, ButtonV2Props>(function ButtonV2(
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
