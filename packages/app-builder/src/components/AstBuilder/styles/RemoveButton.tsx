import clsx from 'clsx';
import * as React from 'react';
import { type ButtonProps } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const RemoveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <button
      className={clsx(
        'size-fit rounded-xs border p-1 text-xs transition-colors duration-200 ease-in-out',
        'bg-surface-card text-grey-secondary border-grey-border',
        'hover:text-grey-white hover:border-red-primary hover:bg-red-primary',
        'active:bg-red-hover active:border-red-hover',
        className,
      )}
      {...props}
      tabIndex={-1}
      ref={ref}
    >
      <Icon icon="delete" className="size-3" />
    </button>
  );
});
RemoveButton.displayName = 'RemoveButton';
