import { type ButtonProps } from '@marble-front/ui/design-system';
import { Trash } from '@marble-front/ui/icons';
import clsx from 'clsx';
import * as React from 'react';

export const RemoveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'hover:bg-red-110 active:bg-red-120 text-grey-00 bg-red-10 h-fit w-fit rounded-sm p-1 text-xs transition-colors duration-200 ease-in-out disabled:bg-red-50 ',
          className
        )}
        {...props}
        ref={ref}
      >
        <Trash />
      </button>
    );
  }
);
RemoveButton.displayName = 'RemoveButton';
