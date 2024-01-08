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
          'animate-slideUpAndFade bg-grey-00 border-grey-10 rounded border shadow-md will-change-[transform,opacity]',
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

const FilterItemRoot = forwardRef<HTMLDivElement, Popover.PopoverAnchorProps>(
  function FilterItem({ className, ...props }, ref) {
    return (
      <FilterPopover.Anchor
        ref={ref}
        className={clsx(
          'bg-purple-05 flex h-10 flex-row items-center rounded',
          className,
        )}
        {...props}
      />
    );
  },
);

const FilterItemTrigger = forwardRef<
  HTMLButtonElement,
  Popover.PopoverTriggerProps
>(function FilterItem({ className, ...props }, ref) {
  return (
    <FilterPopover.Trigger
      ref={ref}
      className={clsx(
        '-mr-1 flex h-full flex-row items-center gap-1 rounded border border-solid border-transparent px-2 text-purple-100 outline-none focus:border-purple-100',
        className,
      )}
      {...props}
    />
  );
});

const FilterItemClear = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'>
>(function FilterItem({ className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        '-ml-1 h-full rounded border border-solid border-transparent px-2 outline-none focus:border-purple-100',
        className,
      )}
      {...props}
    >
      <Icon icon="cross" className="size-5 shrink-0 text-purple-100" />
    </button>
  );
});

export const FilterItem = {
  Root: FilterItemRoot,
  Trigger: FilterItemTrigger,
  Clear: FilterItemClear,
};
