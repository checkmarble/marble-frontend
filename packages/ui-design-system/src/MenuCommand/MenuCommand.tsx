import { createComponentState, useCallbackRef } from '@marble/shared';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Popover from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { Command } from 'cmdk';
import * as React from 'react';
import { Icon } from 'ui-icons';

import { input as inputClassname } from '../Input/Input';
import { assertValue, cn } from '../utils';

// type MenuCommandStore = {
//   search: string;
// };

const MenuCommandState = createComponentState({
  name: 'MenuCommand',
  factory: () => ({
    search: '',
  }),
});

type MenuCommandContextValue = { hover: boolean; onSelect: () => void };
const MenuCommandContext = React.createContext<MenuCommandContextValue | undefined>(undefined);
const useMenuCommandContext = () => {
  return assertValue(
    React.useContext(MenuCommandContext),
    'useMenuCommandContext must be used with MenuCommand',
  );
};

type RootProps = Omit<React.ComponentProps<typeof Popover.Root>, 'className'> & {
  parentCtx?: MenuCommandContextValue;
  hover?: boolean;
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
  const menuStore = MenuCommandState.createStore();

  return (
    <MenuCommandState.Provider value={menuStore}>
      <Root {...props} />
    </MenuCommandState.Provider>
  );
}

function Root({ parentCtx, hover = false, ...props }: RootProps) {
  const onOpenChange = props.onOpenChange;
  const ctxValue: MenuCommandContextValue = React.useMemo(() => {
    return {
      hover,
      onSelect: () => {
        onOpenChange?.(false);
        parentCtx?.onSelect();
      },
    };
  }, [parentCtx, hover, onOpenChange]);
  const RootEl = ctxValue.hover ? HoverCard.Root : Popover.Root;

  return (
    <MenuCommandContext.Provider value={ctxValue}>
      <RootEl openDelay={150} closeDelay={150} {...props} />
    </MenuCommandContext.Provider>
  );
}

type SubMenuProps = Omit<RootProps, 'open' | 'onOpenChange'> & {
  className?: string;
  trigger: React.ReactNode;
  forceMount?: boolean;
};
function SubMenu({ children, trigger, forceMount, className, ...props }: SubMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ctx = useMenuCommandContext();

  return (
    <Command.Group forceMount={forceMount}>
      <Root {...props} hover open={open} onOpenChange={setOpen} parentCtx={ctx}>
        <Trigger>
          <Item className="group/menu-item">
            <span>{trigger}</span>
            <Icon
              aria-hidden="true"
              icon="arrow-right"
              className="group-data-[state=open]/menu-item:text-purple-65 ml-auto size-5 shrink-0 rtl:rotate-180"
            />
          </Item>
        </Trigger>
        <Content side="right" align="start" sideOffset={12} className={className}>
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
  const ctx = useMenuCommandContext();
  const TriggerEl = ctx.hover ? HoverCard.Trigger : Popover.Trigger;

  return <TriggerEl asChild>{children}</TriggerEl>;
}

const contentClassname = cva('flex', {
  variants: {
    hover: {
      true: 'max-h-[min(var(--radix-hover-card-content-available-height),_500px)]',
      false: 'max-h-[min(var(--radix-popover-content-available-height),_500px)]',
    },
  },
  defaultVariants: {
    hover: false,
  },
});

const commandClassname = cva(
  [
    'flex flex-col w-full flex-1 overflow-hidden',
    'bg-grey-100 border-grey-90 rounded border shadow-md outline-none',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2',
  ],
  {
    variants: {
      sameWidth: {
        true: 'min-w-[var(--radix-popover-trigger-width)]',
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
function Content({ children, className, sameWidth, bottom, ...props }: ContentProps) {
  const ctx = useMenuCommandContext();
  const Portal = ctx.hover ? HoverCard.Portal : Popover.Portal;
  const ContentEl = ctx.hover ? HoverCard.Content : Popover.Content;

  return (
    <Portal>
      <ContentEl className={cn(contentClassname({ hover: ctx.hover }), className)} {...props}>
        <Command className={cn(commandClassname({ sameWidth }))}>{children}</Command>
      </ContentEl>
    </Portal>
  );
}

type ComboboxProps = Omit<React.ComponentProps<typeof Command.Input>, 'value'> & {};
function Combobox({ className, onValueChange, ...props }: ComboboxProps) {
  const menuState = MenuCommandState.useStoreValue((s) => s);
  const setSearch = useCallbackRef((value: string) => {
    menuState.search = value;
    onValueChange?.(value);
  });

  return (
    <div className="relative m-2 h-10">
      <Command.Input
        className={cn(inputClassname(), 'ps-10', className)}
        value={menuState.$search?.value}
        onValueChange={setSearch}
        {...props}
      />
      <div className="text-grey-50 peer-focus:text-grey-00 pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
        <Icon icon="search" className="size-6" />
      </div>
    </div>
  );
}

type ItemProps = Omit<React.ComponentProps<typeof Command.Item>, 'asChild'> & {};
const HeadlessItem = React.forwardRef<React.ElementRef<typeof Command.Item>, ItemProps>(
  function HeadlessItem({ onSelect, ...props }, ref) {
    const ctx = useMenuCommandContext();
    const menuOnSelect = React.useCallback(
      (value: string) => {
        onSelect?.(value);
        ctx.onSelect();
      },
      [onSelect, ctx],
    );

    return <Command.Item ref={ref} onSelect={menuOnSelect} {...props} />;
  },
);
const Item = React.forwardRef<React.ElementRef<typeof Command.Item>, ItemProps>(function Item(
  { className, ...props },
  ref,
) {
  return (
    <HeadlessItem
      ref={ref}
      className={cn(
        [
          'hover:bg-purple-98 data-[state=open]:bg-purple-98 outline-none',
          'flex min-h-10 scroll-mb-2 scroll-mt-12 flex-row items-center justify-between gap-2 rounded-sm p-2',
        ],
        className,
      )}
      {...props}
    />
  );
});

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
  Combobox,
  Content,
  Item,
  HeadlessItem,
  List,
  Menu,
  SubMenu,
  Trigger,
  Group: Command.Group,
  State: MenuCommandState,
};
