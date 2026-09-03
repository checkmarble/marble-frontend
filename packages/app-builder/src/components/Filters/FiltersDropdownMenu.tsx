import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

const FiltersDropdownMenuContent = function FiltersDropdownMenuContent({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Content> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        className={clsx(
          'animate-slide-up-and-fade bg-surface-card border-grey-border rounded-sm border shadow-md will-change-[transform,opacity]',
          className,
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
};

const FiltersDropdownMenuItem = function FiltersDropdownMenuItem({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <DropdownMenu.Item
      ref={ref}
      className={clsx(
        'radix-highlighted:bg-purple-background-light flex flex-row gap-sm rounded-sm p-sm outline-hidden transition-colors',
        className,
      )}
      {...props}
    />
  );
};

export const FiltersDropdownMenu = {
  Root: DropdownMenu.Root,
  Trigger: DropdownMenu.Trigger,
  Content: FiltersDropdownMenuContent,
  Item: FiltersDropdownMenuItem,
};
