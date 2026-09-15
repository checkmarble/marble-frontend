import clsx from 'clsx';
import * as React from 'react';
import { type ButtonV2Props } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const RemoveButton = ({ ref, className, ...props }: ButtonV2Props & { ref?: React.Ref<HTMLButtonElement> }) => {
  return (
    <button
      type="button"
      className={clsx(
        'size-fit rounded-xs border p-xs text-xs transition-colors duration-200 ease-in-out',
        'bg-surface-card text-grey-secondary border-grey-border',
        'hover:text-grey-white hover:border-red-primary hover:bg-red-primary',
        'active:bg-red-hover active:border-red-hover',
        'disabled:bg-grey-background-light disabled:text-grey-disabled disabled:border-grey-border',
        'disabled:hover:text-grey-disabled disabled:hover:border-grey-border disabled:hover:bg-grey-background-light',
        className,
      )}
      {...props}
      tabIndex={-1}
      ref={ref}
    >
      <Icon icon="delete" className="size-3" />
    </button>
  );
};
