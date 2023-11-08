import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { forwardRef } from 'react';

const FilterPopoverContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Popover.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <Popover.Portal>
      <Popover.Content
        ref={ref}
        className={clsx(
          'animate-slideUpAndFade bg-grey-00 border-grey-10 flex flex-col gap-2 rounded border p-1 shadow-md will-change-[transform,opacity]',
          className
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
FilterPopoverContent.displayName = 'FilterPopoverContent';

export const FilterPopover = {
  Root: Popover.Root,
  Trigger: Popover.Trigger,
  Anchor: Popover.Anchor,
  Content: FilterPopoverContent,
};
