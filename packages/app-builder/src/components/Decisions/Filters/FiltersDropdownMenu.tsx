import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { forwardRef } from 'react';

const FiltersDropdownMenuContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        className={clsx(
          'animate-slideUpAndFade bg-grey-00 border-grey-10 rounded border shadow-md will-change-[transform,opacity]',
          className
        )}
        side="bottom"
        align="end"
        sideOffset={8}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
});
FiltersDropdownMenuContent.displayName = 'FiltersDropdownMenuContent';

const FiltersDropdownMenuItem = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenu.Item>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenu.Item
      ref={ref}
      className={clsx(
        'radix-highlighted:bg-purple-05 flex flex-row gap-2 rounded p-2 outline-none',
        className
      )}
      {...props}
    />
  );
});
FiltersDropdownMenuItem.displayName = 'FiltersDropdownMenuItem';

export const FiltersDropdownMenu = {
  Root: DropdownMenu.Root,
  Trigger: DropdownMenu.Trigger,
  Content: FiltersDropdownMenuContent,
  Item: FiltersDropdownMenuItem,
};
