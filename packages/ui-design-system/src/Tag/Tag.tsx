import clsx from 'clsx';
import * as React from 'react';

import { type tagBorder, type tagColors, type tagSize } from './Tag.constants';

export interface TagProps extends React.ComponentProps<'span'> {
  border?: (typeof tagBorder)[number];
  color?: (typeof tagColors)[number];
  size?: (typeof tagSize)[number];
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { size = 'small', border = 'rounded-sm', color = 'purple', className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center border border-transparent dark:bg-transparent',
        {
          'bg-purple-96 text-purple-65 dark:border-purple-primary dark:text-purple-primary': color === 'purple',
          'bg-blue-96 text-blue-58 dark:border-blue-58 dark:text-blue-58': color === 'blue',
          'bg-green-94 text-green-38 dark:border-green-38 dark:text-green-38': color === 'green',
          'bg-yellow-90 text-yellow-50 dark:border-yellow-50 dark:text-yellow-50': color === 'yellow',
          'bg-orange-95 text-orange-50 dark:border-orange-50 dark:text-orange-50': color === 'orange',
          'bg-red-95 text-red-47 dark:border-red-47 dark:text-red-47': color === 'red',
          'bg-grey-95 text-grey-50 dark:border-grey-secondary dark:text-grey-secondary': color === 'grey',
          'bg-surface-card text-grey-00 dark:border-grey-primary dark:text-grey-primary': color === 'grey-light',
        },
        {
          'rounded-full': border === 'rounded-sm',
          rounded: border === 'square',
        },
        {
          'min-h-6 px-2 text-xs font-medium': size === 'small',
          'text-s min-h-8 px-2 font-semibold': size === 'big',
        },
        className,
      )}
      {...props}
    />
  );
});

export default Tag;
