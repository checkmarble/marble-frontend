import clsx from 'clsx';
import { forwardRef } from 'react';

export const variants = ['primary', 'secondary'] as const;
export type Variant = (typeof variants)[number];

export const variantColors: Record<Variant, readonly string[]> = {
  primary: ['purple', 'green', 'red'],
  secondary: ['grey'],
} as const;

export type PrimaryColor = (typeof variantColors)['primary'][number];
export type SecondaryColor = (typeof variantColors)['secondary'][number];

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
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      color = variant === 'primary' ? 'purple' : 'grey',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'text-s flex flex-row items-center justify-center gap-1 rounded px-4 py-2 text-base font-semibold',
          {
            'hover:bg-green-110 active:bg-green-120 text-grey-00 bg-green-100 disabled:bg-green-50':
              variant === 'primary' && color === 'green',

            'hover:bg-purple-110 active:bg-purple-120 text-grey-00 bg-purple-100 disabled:bg-purple-50':
              variant === 'primary' && color === 'purple',

            'hover:bg-red-110 active:bg-red-120 text-grey-00 bg-red-100 disabled:bg-red-50':
              variant === 'primary' && color === 'red',

            'hover:bg-grey-05 active:bg-grey-10 bg-grey-00 disabled:bg-grey-00 border-grey-10 text-grey-100 disabled:text-grey-50 border border-solid':
              variant === 'secondary' && color === 'grey',
          },
          className
        )}
        {...props}
      />
    );
  }
);
