import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';

const FilterPopoverContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof Popover.Content>>(
  function FilterPopoverContent({ className, children, ...props }, ref) {
    return (
      <Popover.Content
        ref={ref}
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={10}
        className={clsx('animate-slideUpAndFade p-0 text-xs shadow-md', className)}
        {...props}
      >
        {children}
      </Popover.Content>
    );
  },
);

export const FilterPopover = {
  Root: Popover.Root,
  Trigger: Popover.Trigger,
  Content: FilterPopoverContent,
};

const FilterItemRoot = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function FilterItem(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-purple-background-light dark:bg-grey-background-light flex h-10 flex-row items-center rounded-sm',
        className,
      )}
      {...props}
    />
  );
});

const FilterItemTrigger = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Popover.Trigger>>(
  function FilterItem({ className, ...props }, ref) {
    return (
      <FilterPopover.Trigger
        ref={ref}
        className={clsx(
          'text-purple-primary dark:text-grey-primary focus:border-purple-primary dark:focus:border-purple-hover -me-xs flex h-full flex-row items-center gap-xs rounded-sm border border-solid border-transparent px-xs outline-hidden',
          className,
        )}
        {...props}
      />
    );
  },
);

const FilterItemClear = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function FilterItem(
  { className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      data-test="filter-item-clear"
      className={clsx(
        'focus:border-purple-primary dark:focus:border-purple-hover -ms-xs h-full rounded-sm border border-solid border-transparent px-xs outline-hidden',
        className,
      )}
      {...props}
    >
      <Icon icon="cross" className="text-purple-primary dark:text-grey-primary size-5 shrink-0" />
    </button>
  );
});

export const FilterItem = {
  Root: FilterItemRoot,
  Trigger: FilterItemTrigger,
  Clear: FilterItemClear,
};
