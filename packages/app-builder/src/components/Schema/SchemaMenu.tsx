import clsx from 'clsx';
import * as React from 'react';
import {
  MenuButton,
  type MenuButtonProps,
  MenuItem,
  type MenuItemProps,
  MenuPopover,
  type MenuProps,
  MenuRoot,
} from 'ui-design-system';

export const SchemaMenuMenuButton = React.forwardRef<HTMLDivElement, Omit<MenuButtonProps, 'ref'>>(
  function SchemaMenuMenuButton({ className, ...props }, ref) {
    return (
      <MenuButton
        ref={ref}
        className={clsx(
          'hover:bg-purple-hover active:bg-purple-hover text-grey-white bg-purple-primary flex size-fit flex-row gap-1 rounded-sm p-2',
          className,
        )}
        {...props}
      />
    );
  },
);

export const SchemaMenuMenuPopover = React.forwardRef<HTMLDivElement, Omit<MenuProps, 'ref'>>(
  function SchemaMenuMenuPopover({ className, ...props }, ref) {
    return (
      <MenuPopover
        ref={ref}
        modal
        unmountOnHide={false}
        className={clsx('flex flex-col gap-2 p-2', className)}
        {...props}
      />
    );
  },
);

export const SchemaMenuMenuItem = React.forwardRef<HTMLDivElement, Omit<MenuItemProps, 'ref'>>(
  function SchemaMenuMenuItem({ className, ...props }, ref) {
    return (
      <MenuItem
        ref={ref}
        className={clsx(
          'data-active-item:bg-purple-background-light flex flex-row gap-2 rounded-sm p-2 outline-hidden',
          className,
        )}
        {...props}
      />
    );
  },
);

export const SchemaMenuRoot = MenuRoot;
