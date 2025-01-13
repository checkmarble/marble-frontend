import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import * as React from 'react';

const WithComboboxContext = React.createContext(false);
const WithComboboxListContext = React.createContext(false);
const HideAllContext = React.createContext<(() => void) | null>(null);

function HideAllContextProvider({ children }: { children: React.ReactNode }) {
  const hideAll = Ariakit.useMenuContext()?.hideAll ?? null;
  return (
    <HideAllContext.Provider value={hideAll}>
      {children}
    </HideAllContext.Provider>
  );
}

interface MenuProviderProps {
  searchValue?: string;
  onSearch?: (value: string) => void;
  children: React.ReactNode;
  isSubmenu: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  rtl?: boolean;
}

function MenuProvider({
  children,
  searchValue,
  onSearch,
  isSubmenu,
  open,
  setOpen,
  rtl,
}: MenuProviderProps) {
  const withCombobox = searchValue !== undefined || onSearch !== undefined;

  const element = (
    <Ariakit.MenuProvider
      open={withCombobox ? undefined : open}
      setOpen={withCombobox ? undefined : setOpen}
      showTimeout={0}
      placement={
        isSubmenu ? (rtl ? 'left-start' : 'right-start') : 'bottom-start'
      }
      /**
       * Explicitly set the parent to null to prevent the menu from being nested (ex: a <Menu> inside a <Menu>)
       * This is necessary to prevent hideAll from closing the parent menu
       *
       * Example:
       * <MenuRoot>
       *   <MenuItem>Item 1</MenuItem>
       *   <Modal>
       *     <MenuRoot> <!-- This menu should not be nested -->
       *       <MenuItem>Item 2</MenuItem>
       *     </MenuRoot>
       *   </Modal>
       * <MenuRoot>
       */
      parent={isSubmenu ? undefined : null}
      rtl={rtl}
    >
      <WithComboboxContext.Provider value={withCombobox}>
        <HideAllContextProvider>{children}</HideAllContextProvider>
      </WithComboboxContext.Provider>
    </Ariakit.MenuProvider>
  );

  if (withCombobox) {
    return (
      <Ariakit.ComboboxProvider
        open={open}
        setOpen={setOpen}
        resetValueOnHide
        value={searchValue}
        setValue={onSearch}
        includesBaseElement={false}
        rtl={rtl}
      >
        {element}
      </Ariakit.ComboboxProvider>
    );
  }

  return element;
}

/**
 * A menu component with or without a combobox.
 * Provides `searchValue` and `onSearch` props to enable a combobox menu.
 *
 * @example
 *  <MenuRoot>
 *    <MenuButton />
 *    <MenuPopover>
 *      <MenuCombobox />
 *      <MenuContent>
 *        <MenuItem />
 *        <MenuItem />
 *        <MenuSeparator />
 *        <MenuGroup>
 *          <MenuGroupLabel />
 *          <MenuItem />
 *          <MenuItem />
 *        </MenuGroup>
 *        <SubMenuRoot>
 *          <MenuButton />
 *          <MenuPopover>
 *            <MenuItem />
 *            <MenuItem />
 *          </MenuPopover>
 *        </SubMenuRoot>
 *      </MenuContent>
 *    </MenuPopover>
 *  </MenuRoot>
 */
export function MenuRoot(props: Omit<MenuProviderProps, 'isSubmenu'>) {
  return <MenuProvider {...props} isSubmenu={false} />;
}

export function SubMenuRoot(props: Omit<MenuProviderProps, 'isSubmenu'>) {
  return <MenuProvider {...props} isSubmenu />;
}

export interface CoreMenuButtonProps
  extends Ariakit.MenuButtonProps<'div' | 'button'> {
  isSubmenu: boolean;
}

const CoreMenuButton = React.forwardRef<HTMLDivElement, CoreMenuButtonProps>(
  function MenuButton({ render, isSubmenu, ...props }, ref) {
    return (
      <Ariakit.MenuButton
        ref={ref}
        onClick={(e: React.SyntheticEvent) => {
          e.stopPropagation();
        }}
        {...props}
        render={isSubmenu ? <MenuItem render={render} /> : render}
      />
    );
  },
);

export type MenuButtonProps = Omit<CoreMenuButtonProps, 'isSubmenu'>;

export const MenuButton = React.forwardRef<HTMLDivElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    return <CoreMenuButton ref={ref} isSubmenu={false} {...props} />;
  },
);

export type SubMenuButtonProps = Omit<CoreMenuButtonProps, 'isSubmenu'>;

export const SubMenuButton = React.forwardRef<
  HTMLDivElement,
  SubMenuButtonProps
>(function SubMenuButton(props, ref) {
  return <CoreMenuButton ref={ref} isSubmenu {...props} />;
});

export interface MenuProps extends Ariakit.MenuProps<'div'> {}

export const MenuPopover = React.forwardRef<HTMLDivElement, MenuProps>(
  function MenuPopover(props, ref) {
    return (
      <Ariakit.Menu
        ref={ref}
        portal
        overlap
        unmountOnHide
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        hideOnInteractOutside={(event) => {
          event.stopPropagation();
          return true;
        }}
        gutter={8}
        {...props}
        className={clsx(
          'bg-grey-100 border-grey-90 flex max-h-[min(var(--popover-available-height),_500px)] -translate-y-1 overflow-hidden rounded border opacity-0 shadow-md outline-none transition-all data-[enter]:translate-y-0 data-[enter]:opacity-100',
          props.className,
        )}
      />
    );
  },
);

export interface MenuComboboxProps extends Ariakit.ComboboxProps<'input'> {}

export const MenuCombobox = React.forwardRef<
  HTMLInputElement,
  MenuComboboxProps
>(function MenuCombobox(props, ref) {
  return <Ariakit.Combobox ref={ref} autoSelect="always" {...props} />;
});

export interface MenuContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuContent({ children, className }: MenuContentProps) {
  // We need to use the WithComboboxListContext to handle nested menus
  //
  // For the nested menu button:
  // - WithComboboxContext can be false if the nested menu has no combobox
  // - WithComboboxListContext is true if the parent menu has a combobox
  const withCombobox = React.useContext(WithComboboxContext);

  const content = (
    <div className={clsx('flex flex-col overflow-hidden', className)}>
      {children}
    </div>
  );

  return (
    <WithComboboxListContext.Provider value={withCombobox}>
      {withCombobox ? <Ariakit.ComboboxList render={content} /> : content}
    </WithComboboxListContext.Provider>
  );
}

export const MenuSeparator = Ariakit.MenuSeparator;
export const MenuGroup = Ariakit.MenuGroup;
export const MenuGroupLabel = Ariakit.MenuGroupLabel;

export interface MenuItemProps
  extends Omit<Ariakit.ComboboxItemProps, 'store'> {
  name?: string;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const hideAll = React.useContext(HideAllContext);
    const searchable = React.useContext(WithComboboxListContext);

    const defaultProps: MenuItemProps = {
      ref,
      focusOnHover: true,
      blurOnHoverEnd: false,
      ...props,
    };

    if (!searchable) {
      return <Ariakit.MenuItem {...defaultProps} />;
    }

    return (
      <Ariakit.ComboboxItem
        {...defaultProps}
        setValueOnClick={false}
        hideOnClick={(event) => {
          // The popover won't be closed if the ComboboxItem is expandable (ex: a submenu)
          const expandable = event.currentTarget.hasAttribute('aria-expanded');
          if (expandable) return false;

          if (hideAll) {
            hideAll();
            return false;
          }
          // Fallback to the default behavior
          return true;
        }}
      />
    );
  },
);
