import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../utils';

export const CtaV2ClassName = cva(
  'text-default font-medium w-fit rounded-md inline-flex items-center gap-xs cursor-pointer transition-colors border border-solid disabled:cursor-default focus-visible:outline-2 outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'outline-purple-primary',
        destructive:
          'bg-red-primary border-red-primary text-white enabled:hover:bg-red-hover enabled:hover:border-red-hover disabled:bg-red-disabled disabled:border-red-disabled dark:text-grey-primary dark:disabled:text-grey-secondary outline-red-primary',
        secondary:
          'bg-surface-card border-grey-border text-grey-primary enabled:hover:bg-grey-background disabled:bg-grey-background disabled:text-grey-disabled dark:enabled:hover:bg-grey-background-light dark:disabled:bg-grey-background-light outline-purple-primary',
        warning: 'outline-orange-primary',
        success: 'outline-green-primary',
      },
      appearance: {
        filled: '',
        stroked: '',
        link: '',
      },
      // Hue for filled buttons. Mainly meaningful with variant="primary"
      // (Figma "Color" axis: Primary / Grey / Red). Defaults to primary.
      color: {
        primary: '',
        grey: '',
        red: '',
      },
      mode: {
        normal: '',
        icon: 'aspect-square justify-center',
      },
      // Heights match Figma: small = 24px, medium = 32px, large = 40px.
      size: {
        small: 'text-small',
        medium: '',
        large: '',
      },
    },
    compoundVariants: [
      // Size + Mode — heights match Figma (small 24px / medium 32px / large 40px).
      // Icon mode is a square that scales with size (icon glyph: 16 / 20 / 24px).
      {
        size: 'small',
        mode: 'normal',
        class: 'h-6 px-sm py-xs',
      },
      {
        size: 'small',
        mode: 'icon',
        class: 'size-6 p-xs',
      },
      {
        size: 'medium',
        mode: 'normal',
        class: 'h-8 p-sm',
      },
      {
        size: 'medium',
        mode: 'icon',
        class: 'size-8 p-sm',
      },
      {
        size: 'large',
        mode: 'normal',
        class: 'h-10 p-sm',
      },
      {
        size: 'large',
        mode: 'icon',
        class: 'size-10 p-sm',
      },
      // Subtle elevation on filled + stroked (Figma "Shadow/light"); not on link
      {
        appearance: 'filled',
        class: 'shadow-[0px_4px_10px_0px_rgba(0,0,0,0.05)]',
      },
      {
        appearance: 'stroked',
        class: 'shadow-[0px_4px_10px_0px_rgba(0,0,0,0.05)]',
      },
      // Primary + Filled + Primary color (default purple)
      {
        variant: 'primary',
        appearance: 'filled',
        color: 'primary',
        class:
          'bg-purple-primary border-purple-primary text-white enabled:hover:bg-purple-hover enabled:hover:border-purple-hover disabled:bg-purple-disabled disabled:border-purple-disabled dark:text-grey-primary dark:enabled:hover:bg-purple-hover dark:enabled:hover:border-purple-hover dark:disabled:text-grey-secondary focus-visible:outline-purple-primary',
      },
      // Primary + Filled + Grey color (Figma Color=Grey)
      {
        variant: 'primary',
        appearance: 'filled',
        color: 'grey',
        class:
          'bg-grey-secondary border-grey-secondary text-grey-white enabled:hover:bg-[#2b2b2c] enabled:hover:border-[#2b2b2c] disabled:bg-grey-disabled disabled:border-grey-disabled focus-visible:outline-grey-secondary dark:bg-[#838292] dark:border-[#838292] dark:text-grey-background dark:enabled:hover:bg-grey-secondary dark:enabled:hover:border-grey-secondary dark:disabled:bg-grey-disabled dark:disabled:border-grey-disabled',
      },
      // Primary + Filled + Red color (Figma Color=Red) — red tokens auto-swap in dark
      {
        variant: 'primary',
        appearance: 'filled',
        color: 'red',
        class:
          'bg-red-primary border-red-primary text-white enabled:hover:bg-red-hover enabled:hover:border-red-hover disabled:bg-red-disabled disabled:border-red-disabled focus-visible:outline-red-primary dark:text-grey-primary',
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
          'bg-transparent border-transparent p-0 h-6 rounded-none enabled:hover:underline enabled:hover:bg-transparent text-purple-primary enabled:hover:text-purple-hover disabled:text-grey-disabled disabled:no-underline dark:text-purple-hover dark:enabled:hover:text-purple-hover dark:disabled:text-purple-disabled',
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
          'bg-transparent border-transparent p-0 h-6 rounded-none enabled:hover:underline enabled:hover:bg-transparent text-grey-secondary enabled:hover:text-grey-primary disabled:text-grey-disabled disabled:no-underline dark:text-grey-secondary dark:enabled:hover:text-grey-primary dark:disabled:text-grey-disabled',
      },
      // Warning + Filled
      {
        variant: 'warning',
        appearance: 'filled',
        class:
          'bg-orange-primary border-orange-primary text-white enabled:hover:bg-orange-hover enabled:hover:border-orange-hover disabled:bg-orange-primary/50 disabled:border-orange-primary/50 focus-visible:outline-orange-primary',
      },
      // Warning + Stroked
      {
        variant: 'warning',
        appearance: 'stroked',
        class:
          'bg-transparent border-orange-primary text-orange-primary enabled:hover:bg-orange-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled focus-visible:outline-orange-primary',
      },
      // Success + Filled
      {
        variant: 'success',
        appearance: 'filled',
        class:
          'bg-green-primary border-green-primary text-white enabled:hover:bg-green-hover enabled:hover:border-green-hover disabled:bg-green-disabled disabled:border-green-disabled focus-visible:outline-green-primary',
      },
      // Success + Stroked
      {
        variant: 'success',
        appearance: 'stroked',
        class:
          'bg-transparent border-green-primary text-green-primary enabled:hover:bg-green-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled focus-visible:outline-green-primary ',
      },
      // destructive stroked
      {
        variant: 'destructive',
        appearance: 'stroked',
        class:
          'bg-transparent border-red-primary text-red-primary enabled:hover:bg-red-primary enabled:hover:text-white disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled focus-visible:outline-red-primary',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      mode: 'normal',
      size: 'small',
      appearance: 'filled',
      color: 'primary',
    },
  },
);

export type ButtonV2Props = VariantProps<typeof CtaV2ClassName> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonV2Props>(function Button(
  {
    variant = 'primary',
    mode = 'normal',
    size = 'small',
    appearance,
    color = 'primary',
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(CtaV2ClassName({ variant, mode, size, appearance, color }), className)}
      {...props}
    />
  );
});
