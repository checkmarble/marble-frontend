import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon } from 'ui-icons';

const FilterPopoverContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Popover.Content>
>(function FilterPopoverContent({ className, children, ...props }, ref) {
  return (
    <Popover.Portal>
      <Popover.Content
        ref={ref}
        className={clsx(
          'animate-slide-up-and-fade bg-grey-100 border-grey-90 rounded-sm border shadow-md will-change-[transform,opacity]',
          className,
        )}
        side="bottom"
        align="start"
        sideOffset={8}
        {...props}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
});

export const FilterPopover = {
  Root: Popover.Root,
  Trigger: Popover.Trigger,
  Anchor: Popover.Anchor,
  Content: FilterPopoverContent,
};

const FilterItemRoot = forwardRef<HTMLDivElement, Popover.PopoverAnchorProps>(function FilterItem(
  { className, ...props },
  ref,
) {
  return (
    <FilterPopover.Anchor
      ref={ref}
      className={clsx('bg-purple-98 flex h-10 flex-row items-center rounded-sm', className)}
      {...props}
    />
  );
});

const FilterItemTrigger = forwardRef<HTMLButtonElement, Popover.PopoverTriggerProps>(
  function FilterItem({ className, ...props }, ref) {
    return (
      <FilterPopover.Trigger
        ref={ref}
        className={clsx(
          'text-purple-65 focus:border-purple-65 -mr-1 flex h-full flex-row items-center gap-1 rounded-sm border border-solid border-transparent px-2 outline-hidden',
          className,
        )}
        {...props}
      />
    );
  },
);

const FilterItemClear = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function FilterItem({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={clsx(
          'focus:border-purple-65 -ml-1 h-full rounded-sm border border-solid border-transparent px-2 outline-hidden',
          className,
        )}
        {...props}
      >
        <Icon icon="cross" className="text-purple-65 size-5 shrink-0" />
      </button>
    );
  },
);

export const FilterItem = {
  Root: FilterItemRoot,
  Trigger: FilterItemTrigger,
  Clear: FilterItemClear,
};
