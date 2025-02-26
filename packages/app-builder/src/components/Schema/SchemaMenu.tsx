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
          'hover:bg-purple-60 active:bg-purple-60 text-grey-100 bg-purple-65 flex size-fit flex-row gap-1 rounded p-2',
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
          'data-[active-item]:bg-purple-98 flex flex-row gap-2 rounded p-2 outline-none',
          className,
        )}
        {...props}
      />
    );
  },
);

export const SchemaMenuRoot = MenuRoot;
