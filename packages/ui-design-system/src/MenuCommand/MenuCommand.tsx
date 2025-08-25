import { useCallbackRef } from '@marble/shared';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Popover from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Command } from 'cmdk';
import * as React from 'react';
import { createSharpFactory } from 'sharpstate';
import { Icon } from 'ui-icons';

import { input as inputClassname } from '../Input/Input';
import { cn } from '../utils';

const MenuCommandSharpFactory = createSharpFactory({
  name: 'MenuCommand',
  initializer: () => ({
    search: '',
  }),
}).withActions({
  setSearch(api, value: string) {
    api.value.search = value;
  },
});

type MenuCommandContextValue = {
  hover: boolean;
  persistOnSelect: boolean;
  onSelect: () => void;
  hasCombobox: boolean;
};
export const InternalMenuSharpFactory = createSharpFactory({
  name: 'InternalMenu',
  initializer: (initialState: {
    hover: boolean;
    persistOnSelect: boolean;
    onSelect: () => void;
  }): MenuCommandContextValue => {
    return { ...initialState, hasCombobox: false };
  },
});

type RootProps = Omit<React.ComponentProps<typeof Popover.Root>, 'className'> & {
  hover?: boolean;
  persistOnSelect?: boolean;
};
/**
 * A Menu command, it can be used as a select, a menu, can have a search bar and be nested
 *
 * @example
 *  <MenuCommand.Menu>
 *    <MenuCommand.Trigger />
 *    <MenuCommand.Content>
 *      <MenuCommand.Combobox />
 *      <MenuCommand.List>
 *        <MenuCommand.Item />
 *        <MenuCommand.Group heading?={<SomeReactElement />}>
 *          <MenuCommand.Item />
 *        </MenuCommand.Group>
 *        <MenuCommand.Separator />
 *        <MenuCommand.SubMenu trigger={<SomeReactElement />}>
 *          <MenuCommand.List>
 *            <MenuCommand.Item />
 *          </MenuCommand.List>
 *        </MenuCommand.SubMenu>
 *      <MenuCommand.List>
 *    </MenuCommand.Content>
 *  </MenuCommand.Menu>
 */
function Menu(props: RootProps) {
  const menuSharp = MenuCommandSharpFactory.createSharp();

  return (
    <MenuCommandSharpFactory.Provider value={menuSharp}>
      <Root {...props} />
    </MenuCommandSharpFactory.Provider>
  );
}

function Root({ hover = false, persistOnSelect, ...props }: RootProps) {
  const onOpenChange = props.onOpenChange;

  const parentInternalSharp = InternalMenuSharpFactory.useOptionalSharp();
  const shouldPersistOnSelect =
    persistOnSelect ?? parentInternalSharp?.value.persistOnSelect ?? false;

  const internalSharp = InternalMenuSharpFactory.createSharp({
    hover,
    persistOnSelect: shouldPersistOnSelect,
    onSelect: () => {
      if (!shouldPersistOnSelect) {
        onOpenChange?.(false);
      }
      parentInternalSharp?.value.onSelect();
    },
  });
  const RootEl = internalSharp.value.hover ? HoverCard.Root : Popover.Root;

  return (
    <InternalMenuSharpFactory.Provider value={internalSharp}>
      <RootEl openDelay={150} closeDelay={150} {...props} />
    </InternalMenuSharpFactory.Provider>
  );
}

type SubMenuProps = Omit<RootProps, 'open' | 'onOpenChange'> & {
  value?: string;
  className?: string;
  trigger: React.ReactNode;
  forceMount?: boolean;
  arrow?: boolean;
  disabled?: boolean;
  persistOnSelect?: boolean;
};

function SubMenu({
  children,
  trigger,
  forceMount,
  className,
  arrow,
  hover = true,
  disabled = false,
  ...props
}: SubMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Command.Group forceMount={forceMount}>
      <Root {...props} hover={hover} open={open} onOpenChange={setOpen}>
        <Trigger>
          <Item
            disabled={disabled}
            className={cn('group/menu-item flex w-full items-center justify-between')}
            onSelect={() => {
              setOpen(true);
            }}
          >
            {trigger}
            {arrow !== undefined && arrow === false ? null : (
              <Icon
                aria-hidden="true"
                icon="arrow-right"
                className="group-data-[state=open]/menu-item:text-purple-65 ml-auto size-5 shrink-0 rtl:rotate-180"
              />
            )}
          </Item>
        </Trigger>
        <Content
          side="right"
          align="start"
          sideOffset={12}
          className={cn('pointer-events-auto', className)}
        >
          {children}
        </Content>
      </Root>
    </Command.Group>
  );
}

/**
 * The trigger to open/close the menu
 * MenuCommand.Trigger child must be forwardRef
 *
 */
function Trigger({ children }: React.PropsWithChildren) {
  const internalSharp = InternalMenuSharpFactory.useSharp();
  const TriggerEl = internalSharp.value.hover ? HoverCard.Trigger : Popover.Trigger;

  const triggerOverrideSharp = InternalMenuSharpFactory.createSharp({
    ...internalSharp.value,
    onSelect() {
      // noop on trigger
    },
  });

  return (
    <InternalMenuSharpFactory.Provider value={triggerOverrideSharp}>
      <TriggerEl asChild>{children}</TriggerEl>
    </InternalMenuSharpFactory.Provider>
  );
}

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { hasError?: boolean; noArrow?: boolean };
const SelectButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function SelectButton(
  { children, className, hasError = false, noArrow, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        clsx([
          'flex h-10 min-w-[40px] items-center justify-between gap-2 rounded-sm border px-2 outline-hidden',
          'bg-grey-100 disabled:border-grey-98 disabled:bg-grey-98',
          'border-grey-90 focus:border-purple-65',
        ]),
        { 'border-red-47': hasError },
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {!noArrow ? <MenuArrow /> : null}
    </button>
  );
});

function MenuArrow() {
  return <Icon icon="caret-down" className="size-4 shrink-0" />;
}

const contentClassname = cva('flex z-50 text-s', {
  variants: {
    hover: {
      true: 'max-h-[min(var(--radix-hover-card-content-available-height),500px)]',
      false: 'max-h-[min(var(--radix-popover-content-available-height),500px)]',
    },
  },
  defaultVariants: {
    hover: false,
  },
});

const commandClassname = cva(
  [
    'flex flex-col z-50 w-full flex-1 overflow-hidden',
    'bg-grey-100 border-grey-90 rounded-sm border shadow-md outline-hidden',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2',
  ],
  {
    variants: {
      sameWidth: {
        true: 'min-w-(--radix-popover-trigger-width)',
        false: '',
      },
    },
    defaultVariants: {
      sameWidth: false,
    },
  },
);
type ContentProps = React.ComponentProps<typeof Popover.Content> &
  VariantProps<typeof commandClassname> & {
    bottom?: React.ReactNode;
  };
function Content({
  children,
  className,
  sameWidth,
  bottom,
  collisionPadding,
  ...props
}: ContentProps) {
  const internalSharp = InternalMenuSharpFactory.useSharp();
  const Portal = internalSharp.value.hover ? HoverCard.Portal : Popover.Portal;
  const ContentEl = internalSharp.value.hover ? HoverCard.Content : Popover.Content;

  return (
    <Portal>
      <ContentEl
        className={cn(contentClassname({ hover: internalSharp.value.hover }), className)}
        collisionPadding={collisionPadding ?? 10}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        {...props}
      >
        <Command className={cn(commandClassname({ sameWidth }))}>
          {children}
          <InsertKeyboardNav />
        </Command>
      </ContentEl>
    </Portal>
  );
}

function InsertKeyboardNav() {
  const internalSharp = InternalMenuSharpFactory.useSharp();
  const [hasCombobox, setHasCombobox] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    setHasCombobox(internalSharp.value.hasCombobox);
  }, [internalSharp]);

  if (hasCombobox === undefined || hasCombobox) return null;
  return <KeyboardNav />;
}

type ComboboxProps = Omit<React.ComponentProps<typeof Command.Input>, 'value'> & {
  iconClasses?: string;
};
function Combobox({ className, onValueChange, iconClasses, ...props }: ComboboxProps) {
  const internalSharp = InternalMenuSharpFactory.useSharp();
  const menuState = MenuCommandSharpFactory.useSharp();
  const setSearch = useCallbackRef((value: string) => {
    menuState.actions.setSearch(value);
    onValueChange?.(value);
  });
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Autofocus the input on render to enable the keyboard nav
  React.useEffect(() => {
    internalSharp.value.hasCombobox = true;
    inputRef.current?.focus();
  }, [internalSharp]);

  return (
    <div className={cn('relative m-2 mb-0 h-10', className)}>
      <Command.Input
        ref={inputRef}
        className={cn(inputClassname(), 'ps-8')}
        value={menuState.value.search}
        onValueChange={setSearch}
        {...props}
      />
      <div className="text-grey-50 peer-focus:text-grey-00 pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
        <Icon icon="search" className={cn('size-5', iconClasses)} />
      </div>
    </div>
  );
}

const KeyboardNav = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Autofocus the input on render to enable the keyboard nav
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <Command.Input ref={inputRef} className="fixed left-[-10000px]" />;
};

type ItemProps = Omit<React.ComponentProps<typeof Command.Item>, 'asChild'> & {
  selected?: boolean;
};
const HeadlessItem = React.forwardRef<React.ElementRef<typeof Command.Item>, ItemProps>(
  function HeadlessItem({ onSelect, ...props }, ref) {
    const internalSharp = InternalMenuSharpFactory.useSharp();
    const menuOnSelect = React.useCallback(
      (value: string) => {
        onSelect?.(value);
        internalSharp.value.onSelect();
      },
      [onSelect, internalSharp],
    );

    return <Command.Item ref={ref} onSelect={menuOnSelect} {...props} />;
  },
);
const Item = React.forwardRef<React.ElementRef<typeof Command.Item>, ItemProps>(function Item(
  { className, selected = false, ...props },
  ref,
) {
  return (
    <HeadlessItem
      ref={ref}
      className={cn(
        [
          'aria-selected:bg-purple-98 data-[state=open]:bg-purple-98 aria-disabled:text-grey-80 outline-hidden',
          'flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-xs p-2',
        ],
        { '': selected, 'cursor-pointer': props.onSelect && !props.disabled },
        className,
      )}
      {...props}
    />
  );
});

const Separator = React.forwardRef<
  React.ElementRef<typeof Command.Separator>,
  React.ComponentPropsWithoutRef<typeof Command.Separator>
>(({ className, ...props }, ref) => (
  <Command.Separator ref={ref} className={cn('bg-grey-90 -mx-2 my-2 h-px', className)} {...props} />
));
Separator.displayName = Command.Separator.displayName;

type ListProps = Omit<React.ComponentProps<typeof Command.List>, 'asChild'> & {};
function List({ className, ...props }: ListProps) {
  return (
    <Command.List
      className={cn('flex-1 overflow-y-auto overflow-x-hidden p-2', className)}
      {...props}
    />
  );
}

export const MenuCommand = {
  Arrow: MenuArrow,
  Anchor: Popover.Anchor,
  Combobox,
  Content,
  Group: Command.Group,
  HeadlessItem,
  Item,
  List,
  Menu,
  SubMenu,
  Trigger,
  SelectButton,
  Separator,
  State: MenuCommandSharpFactory,
  Empty: Command.Empty,
};
