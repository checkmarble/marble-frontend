import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import * as React from 'react';

const WithComboboxContext = React.createContext(false);
const WithComboboxListContext = React.createContext(false);
const ParentContext = React.createContext(false);
const HideAllContext = React.createContext<(() => void) | null>(null);

function HideAllContextProvider({ children }: { children: React.ReactNode }) {
  const hideAll = Ariakit.useMenuContext()?.hideAll ?? null;
  return (
    <HideAllContext.Provider value={hideAll}>
      {children}
    </HideAllContext.Provider>
  );
}

export interface MenuRootProps {
  searchValue?: string;
  onSearch?: (value: string) => void;
  children: React.ReactNode;
}

/**
 * A menu component.
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
 *      </MenuContent>
 *    </MenuPopover>
 *  </MenuRoot>
 */
export function MenuRoot({ children, searchValue, onSearch }: MenuRootProps) {
  const parent = React.useContext(ParentContext);
  const withCombobox = searchValue !== undefined || onSearch !== undefined;

  const element = (
    <Ariakit.MenuProvider
      showTimeout={0}
      placement={parent ? 'right-start' : 'bottom-start'}
    >
      <WithComboboxContext.Provider value={withCombobox}>
        <HideAllContextProvider>{children}</HideAllContextProvider>
      </WithComboboxContext.Provider>
    </Ariakit.MenuProvider>
  );

  if (withCombobox) {
    return (
      <Ariakit.ComboboxProvider
        resetValueOnHide
        value={searchValue}
        setValue={onSearch}
        includesBaseElement={false}
      >
        {element}
      </Ariakit.ComboboxProvider>
    );
  }

  return element;
}

export interface MenuButtonProps
  extends Ariakit.MenuButtonProps<'div' | 'button'> {}

export const MenuButton = React.forwardRef<HTMLDivElement, MenuButtonProps>(
  function MenuButton({ render, ...props }, ref) {
    const parent = React.useContext(ParentContext);

    return (
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        render={parent ? <MenuItem render={render} /> : render}
      />
    );
  },
);

export interface MenuProps extends Ariakit.MenuProps<'div'> {}

export const MenuPopover = React.forwardRef<HTMLDivElement, MenuProps>(
  function MenuPopover(props, ref) {
    return (
      <ParentContext.Provider value={true}>
        <Ariakit.Menu
          ref={ref}
          portal
          overlap
          unmountOnHide
          gutter={8}
          {...props}
          className={clsx(
            'animate-slideUpAndFade bg-grey-00 border-grey-10 flex max-h-[min(var(--popover-available-height),_300px)] overflow-hidden rounded border shadow-md outline-none will-change-[transform,opacity]',
            props.className,
          )}
        />
      </ParentContext.Provider>
    );
  },
);

export interface MenuComboboxProps extends Ariakit.ComboboxProps<'input'> {}

export const MenuCombobox = React.forwardRef<
  HTMLInputElement,
  MenuComboboxProps
>(function MenuCombobox(props, ref) {
  return <Ariakit.Combobox ref={ref} autoSelect {...props} />;
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
