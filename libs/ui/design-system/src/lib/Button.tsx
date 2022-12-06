import clsx from 'clsx';

export const variants = ['primary', 'secondary'] as const;
export type Variant = typeof variants[number];

export const variantColors: Record<Variant, readonly string[]> = {
  primary: ['purple', 'green', 'red'],
  secondary: ['grey'],
} as const;

export type PrimaryColor = typeof variantColors['primary'][number];
export type SecondaryColor = typeof variantColors['secondary'][number];

/* eslint-disable-next-line */
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

export function Button({
  variant = 'primary',
  color = variant === 'primary' ? 'purple' : 'grey',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'text-text-s-semibold-cta  flex flex-row items-center gap-1 rounded py-2 px-4 text-base font-semibold',
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

export default Button;
