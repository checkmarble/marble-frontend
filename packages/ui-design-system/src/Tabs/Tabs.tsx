import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, createContext, type ReactNode, type Ref, useContext, useMemo } from 'react';
import { cn } from '../utils';

/**
 * Shared tab item styles.
 *
 * Active state works for both:
 * - Links: `aria-current="page"` (set by the router when the destination matches)
 * - Buttons: `data-status="active"` (set by `Tabs.Button`, or by `Tabs.Link` via `active`)
 *
 * @deprecated Use `Tabs.Button` / `Tabs.Link` instead of applying this class yourself.
 */
export const tabClassName = cn(
  'flex items-center h-8 px-sm text-s font-medium rounded-sm',
  'bg-purple-background text-purple-primary',
  'dark:bg-transparent dark:text-grey-placeholder',
  // Active state via aria-current (NavLink)
  'aria-[current=page]:bg-purple-primary aria-[current=page]:text-white',
  'aria-[current=page]:dark:bg-purple-primary aria-[current=page]:dark:text-grey-white',
  // Active state via data-status (Button)
  'data-[status=active]:bg-purple-primary data-[status=active]:text-white',
  'data-[status=active]:dark:bg-purple-primary data-[status=active]:dark:text-grey-white',
  // Disabled state
  'aria-disabled:text-grey-secondary',
);

const tabsClassName = cva(
  'flex p-xs gap-xs rounded-md bg-purple-background self-start justify-self-start dark:bg-grey-background',
  {
    variants: {
      variant: {
        default: '',
        fluid: 'flex-wrap',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TabsContextValue = {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
};

const TabsContext = createContext<TabsContextValue>({
  value: undefined,
  onValueChange: undefined,
});

interface TabsProps<T extends string = string> extends VariantProps<typeof tabsClassName> {
  children: ReactNode;
  /** Currently selected tab. Used by `Tabs.Button` when it has a matching `value`. */
  value?: T;
  /** Called when a `Tabs.Button` with a `value` is clicked. */
  onValueChange?: (value: T) => void;
}

function TabsRoot<T extends string = string>({ children, variant, value, onValueChange }: TabsProps<T>) {
  const contextValue = useMemo(
    (): TabsContextValue => ({
      value,
      onValueChange: onValueChange as TabsContextValue['onValueChange'],
    }),
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div role="tablist" className={tabsClassName({ variant })}>
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
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
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
      className={cn(tabClassName, className)}
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
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      {...props}
      role="tab"
      className={cn(tabClassName, className)}
      data-status={active ? 'active' : undefined}
    />
  );
}
TabsLink.displayName = 'Tabs.Link';

export const Tabs = Object.assign(TabsRoot, {
  Button: TabsButton,
  Link: TabsLink,
});
