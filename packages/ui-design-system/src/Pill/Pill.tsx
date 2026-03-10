import clsx from 'clsx';
import * as React from 'react';

import { pillBorder, pillColor, pillSize } from './Pill.constants';

export interface PillProps extends React.ComponentProps<'span'> {
  size?: (typeof pillSize)[number];
  border?: (typeof pillBorder)[number];
  color?: (typeof pillColor)[number];
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill(
  { size = 'small', border = 'rounded', color = 'primary', className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1 justify-center border  text-nowrap rounded-full ',
        {
          'rounded-full': border === 'rounded',
          'rounded-sm': border === 'square',
        },
        {
          'min-h-6 px-2 text-xs font-medium': size === 'small',
          'text-s min-h-8 px-2 font-semibold': size === 'medium',
          'text-m min-h-10 px-2 font-semibold': size === 'big',
        },
        {
          'border-grey-border dark:bg-grey-background-light bg-surface-card text-grey-primary dark:text-grey-primary':
            color === 'primary',
          'border-grey-border dark:bg-grey-background-light bg-surface-card text-grey-placeholder': color === 'grey',
        },
        className,
      )}
      {...props}
    />
  );
});

export default Pill;
