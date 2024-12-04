import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

export const CtaClassName = cva(
  'text-s flex flex-row items-center justify-center gap-1 rounded px-4 py-2 font-semibold outline-none border border-solid transition-colors',
  {
    variants: {
      variant: {
        primary: 'text-grey-00 focus:border-grey-100',
        secondary:
          'text-grey-100 bg-grey-00 border-grey-10 disabled:text-grey-50 aria-disabled:text-gray-50 disabled:border-grey-05 aria-disabled:border-grey-05 disabled:bg-grey-05 aria-disabled:bg-grey-05',
        tertiary: 'text-grey-25 border-transparent',
        outline:
          'hover:bg-purple-25 active:bg-purple-10 bg-purple-05 border-purple-100 text-purple-100 disabled:text-grey-50 aria-disabled:text-gray-50 disabled:border-grey-05 aria-disabled:border-grey-05 disabled:bg-grey-05 aria-disabled:bg-grey-05 focus:border-purple-110',
      },
      color: {
        purple:
          'hover:bg-purple-110 active:bg-purple-120 border-purple-100 bg-purple-100 disabled:bg-purple-50 aria-disabled:bg-purple-50',
        green:
          'hover:bg-green-110 active:bg-green-120 border-green-100 bg-green-100 disabled:bg-green-50 aria-disabled:bg-green-50',
        red: 'hover:bg-red-110 active:bg-red-120 border-red-100 bg-red-100 disabled:bg-red-50 aria-disabled:bg-red-50',
        grey: 'hover:bg-grey-05 active:bg-grey-10 focus:border-purple-100',
      },
    },
  },
);

export type ButtonProps = VariantProps<typeof CtaClassName> &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;

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
        className={CtaClassName({ variant, color, className })}
        {...props}
      />
    );
  },
);
