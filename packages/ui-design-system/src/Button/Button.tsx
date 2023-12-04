import clsx from 'clsx';
import { forwardRef } from 'react';

export const variants = ['primary', 'secondary', 'tertiary'] as const;
export type Variant = (typeof variants)[number];

export const variantColors: Record<Variant, readonly string[]> = {
  primary: ['purple', 'green', 'red'],
  secondary: ['grey'],
  tertiary: ['grey'],
} as const;

export type PrimaryColor = (typeof variantColors)['primary'][number];
export type SecondaryColor = (typeof variantColors)['secondary'][number];
export type TertiaryColor = (typeof variantColors)['tertiary'][number];

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  (
    | {
        variant?: 'primary';
        color?: PrimaryColor;
      }
    | {
        variant: 'secondary';
        color?: SecondaryColor;
      }
    | {
        variant: 'tertiary';
        color?: TertiaryColor;
      }
  );

export function CtaClassName({
  variant,
  color,
}: Pick<ButtonProps, 'variant' | 'color'>) {
  return clsx(
    'text-s flex flex-row items-center justify-center gap-1 rounded px-4 py-2 font-semibold outline-none border border-solid',
    {
      'hover:bg-green-110 active:bg-green-120  text-grey-00 border-bg-green-100 focus:border-grey-100 bg-green-100 disabled:bg-green-50':
        variant === 'primary' && color === 'green',

      'hover:bg-purple-110 active:bg-purple-120  text-grey-00 border-bg-purple-100 focus:border-grey-100   bg-purple-100 disabled:bg-purple-50':
        variant === 'primary' && color === 'purple',

      'hover:bg-red-110 active:bg-red-120  text-grey-00 border-bg-red-100 focus:border-grey-100 bg-red-100 disabled:bg-red-50':
        variant === 'primary' && color === 'red',

      'hover:bg-grey-05 active:bg-grey-10  bg-grey-00 border-grey-10 text-grey-100 disabled:text-grey-50 disabled:border-grey-05 disabled:bg-grey-05 focus:border-purple-100':
        variant === 'secondary' && color === 'grey',

      'hover:bg-grey-05 active:bg-grey-10 bg-grey-00 text-grey-25 border-grey-00 focus:border-purple-100':
        variant === 'tertiary' && color === 'grey',
    },
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      color = variant === 'primary' ? 'purple' : 'grey',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(CtaClassName({ variant, color }), className)}
        {...props}
      />
    );
  },
);
