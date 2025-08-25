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
        'inline-flex items-center justify-center',
        {
          'bg-purple-96 text-purple-65': color === 'purple',
          'bg-blue-96 text-blue-58': color === 'blue',
          'bg-green-94 text-green-38': color === 'green',
          'bg-yellow-90 text-yellow-50': color === 'yellow',
          'bg-orange-95 text-orange-50': color === 'orange',
          'bg-red-95 text-red-47': color === 'red',
          'bg-grey-95 text-grey-50': color === 'grey',
          'bg-grey-100 text-grey-00': color === 'grey-light',
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
