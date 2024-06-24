import clsx from 'clsx';
import * as React from 'react';
import { type ButtonProps } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const RemoveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'size-fit rounded-sm border p-1 text-xs transition-colors duration-200 ease-in-out',
          'bg-grey-00 text-grey-25 border-grey-10',
          'hover:text-grey-00 hover:border-red-100 hover:bg-red-100',
          'active:bg-red-110 active:border-red-110',
          className,
        )}
        {...props}
        tabIndex={-1}
        ref={ref}
      >
        <Icon icon="delete" className="size-3" />
      </button>
    );
  },
);
RemoveButton.displayName = 'RemoveButton';
