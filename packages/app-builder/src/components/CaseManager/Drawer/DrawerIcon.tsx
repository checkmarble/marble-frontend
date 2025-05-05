import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const drawerIconColorVariants = cva(['flex items-center justify-center'], {
  variants: {
    active: {
      false: 'text-grey-90',
      true: 'text-purple-65',
    },
  },
  defaultVariants: {
    active: false,
  },
});

type DrawerIconProps = { size: 'small' | 'large' } & VariantProps<typeof drawerIconColorVariants>;

export function DrawerIcon({ size, active }: DrawerIconProps) {
  return (
    <span tabIndex={-1} className={clsx('size-5', drawerIconColorVariants({ active }))}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        {size === 'large' ? (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H8Z"
            fill="currentColor"
          />
        ) : (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM14 6C13.4477 6 13 6.44772 13 7V17C13 17.5523 13.4477 18 14 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H14Z"
            fill="currentColor"
          />
        )}
      </svg>
    </span>
  );
}
