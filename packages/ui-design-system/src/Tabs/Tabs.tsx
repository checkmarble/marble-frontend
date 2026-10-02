import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, createContext, type ReactNode, type Ref, useContext, useMemo } from 'react';
import { cn } from '../utils';

const tabClassName = cva(
  [
    'flex items-center h-8 px-sm text-s font-medium aria-disabled:text-grey-secondary cursor-pointer aria-disabled:cursor-not-allowed transition-all duration-200',
  ],
  {
    variants: {
      color: {
        purple: [
          'rounded-sm',
          'bg-purple-background text-purple-primary hover:text-purple-hover hover:not-dark:bg-purple-hover/10',
          'dark:bg-transparent dark:text-grey-placeholder hover:dark:text-grey-hover',
          // Active state via aria-current (NavLink)
          'aria-[current=page]:bg-purple-primary aria-[current=page]:text-white',
          'aria-[current=page]:dark:bg-purple-primary aria-[current=page]:dark:text-grey-white',
          // Active state via data-status (Button)
          'data-[status=active]:bg-purple-primary data-[status=active]:text-white',
          'data-[status=active]:dark:bg-purple-primary data-[status=active]:dark:text-grey-white',
        ],
        grey: [
          'rounded-md border border-grey-border gap-sm hover:border-grey-primary hover:bg-grey-hover/5',
          'aria-[current=page]:border-purple-primary',
          'data-[status=active]:border-purple-primary',
        ],
      },
    },
    defaultVariants: {
      color: 'purple',
    },
  },
);

type TabColor = NonNullable<VariantProps<typeof tabClassName>['color']>;

const tabsClassName = cva('flex p-xs gap-xs rounded-md self-start justify-self-start items-center', {
  variants: {
    variant: {
      default: '',
      fluid: 'flex-wrap',
    },
    color: {
      purple: 'bg-purple-background dark:bg-grey-background',
      grey: '',
    } satisfies Record<TabColor, string>,
  },
  defaultVariants: {
    color: 'purple',
    variant: 'default',
  },
});

type TabsContextValue = {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  color: TabColor;
};

const TabsContext = createContext<TabsContextValue>({
  value: undefined,
  onValueChange: undefined,
  color: 'purple',
});

interface TabsProps<T extends string = string> extends VariantProps<typeof tabsClassName> {
  children: ReactNode;
  /** Currently selected tab. Used by `Tabs.Button` when it has a matching `value`. */
  value?: T;
  /** Called when a `Tabs.Button` with a `value` is clicked. */
  onValueChange?: (value: T) => void;
}

function TabsRoot<T extends string = string>({ children, variant, color, value, onValueChange }: TabsProps<T>) {
  const resolvedColor = color ?? 'purple';
  const contextValue = useMemo(
    (): TabsContextValue => ({
      value,
      onValueChange: onValueChange as TabsContextValue['onValueChange'],
      color: resolvedColor,
    }),
    [value, onValueChange, resolvedColor],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div role="tablist" className={tabsClassName({ variant, color: resolvedColor })}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}
TabsRoot.displayName = 'Tabs';

interface TabsButtonProps extends ComponentProps<'button'> {
  /** Force the active style. When omitted, derived from the parent `Tabs` `value`. */
  active?: boolean;
  /** Tab identity. Combined with parent `value` / `onValueChange` to manage selection. */
  value?: string;
  ref?: Ref<HTMLButtonElement>;
}

function TabsButton({ active, value, className, onClick, type = 'button', ref, ...props }: TabsButtonProps) {
  const { value: selectedValue, onValueChange, color } = useContext(TabsContext);
  const isActive = active ?? (value !== undefined && selectedValue === value);

  return (
    <button
      ref={ref}
      {...props}
      type={type}
      role="tab"
      aria-selected={isActive}
      data-status={isActive ? 'active' : undefined}
      value={value}
      className={cn(tabClassName({ color }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && value !== undefined) {
          onValueChange?.(value);
        }
      }}
    />
  );
}
TabsButton.displayName = 'Tabs.Button';

interface TabsLinkProps extends ComponentProps<'a'> {
  /**
   * Merge tab styles onto the child (typically a router `Link`) instead of rendering an `<a>`.
   */
  asChild?: boolean;
  /**
   * Force the active style via `data-status`. Prefer the router's `aria-current="page"` when it
   * already reflects the active destination.
   */
  active?: boolean;
  ref?: Ref<HTMLAnchorElement>;
}

function TabsLink({ asChild, active, className, ref, ...props }: TabsLinkProps) {
  const { color } = useContext(TabsContext);
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      {...props}
      role="tab"
      className={cn(tabClassName({ color }), className)}
      data-status={active ? 'active' : undefined}
    />
  );
}
TabsLink.displayName = 'Tabs.Link';

export const Tabs = Object.assign(TabsRoot, {
  Button: TabsButton,
  Link: TabsLink,
});
