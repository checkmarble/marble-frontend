import clsx from 'clsx';
import * as React from 'react';
import { type ButtonProps } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const RemoveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'size-fit rounded-xs border p-1 text-xs transition-colors duration-200 ease-in-out',
          'bg-grey-100 text-grey-80 border-grey-90',
          'hover:text-grey-100 hover:border-red-47 hover:bg-red-47',
          'active:bg-red-43 active:border-red-43',
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
