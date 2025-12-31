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
          'bg-purple-background text-purple-primary dark:border-purple-primary dark:text-purple-primary':
            color === 'purple',
          'bg-blue-96 text-blue-58 dark:border-blue-58 dark:text-blue-58': color === 'blue',
          'bg-green-94 text-green-38 dark:border-green-38 dark:text-green-38': color === 'green',
          'bg-yellow-90 text-yellow-50 dark:border-yellow-50 dark:text-yellow-50': color === 'yellow',
          'bg-orange-background-light text-orange-primary dark:border-orange-primary dark:text-orange-primary':
            color === 'orange',
          'bg-red-background text-red-primary dark:border-red-primary dark:text-red-primary': color === 'red',
          'bg-grey-background text-grey-placeholder dark:border-grey-secondary dark:text-grey-secondary':
            color === 'grey',
          'bg-surface-card text-grey-primary dark:border-grey-primary dark:text-grey-primary': color === 'grey-light',
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
