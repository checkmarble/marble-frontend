import * as PopoverPrimitive from '@radix-ui/react-popover';
import { type VariantProps } from 'class-variance-authority';
import { Command } from 'cmdk';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from 'ui-icons';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';
import { selectTrigger } from '../Select/Select';
import { cn } from '../utils';

type Value = string | string[];

export interface SelectWithComboboxProviderProps<T extends Value = Value> {
  defaultOpen?: boolean;
  /**
   * When provided, the list renders inline (no trigger, no popover) and is always visible.
   * Consumers that render `Select` + `Popover` must leave this undefined.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  defaultSearchValue?: string;
  selectedValue?: T;
  onSelectedValueChange?: (value: T) => void;
  defaultSelectedValue?: T;
  children: React.ReactNode;
}

type SelectWithComboboxContextValue = {
  search: string;
  setSearch: (value: string) => void;
  isMultiple: boolean;
  isChecked: (value: string) => boolean;
  toggle: (value: string) => void;
  reportItem: (value: string, disabled: boolean) => void;
};

const SelectWithComboboxContext = createContext<SelectWithComboboxContextValue | null>(null);

function useSelectWithComboboxContext() {
  const context = useContext(SelectWithComboboxContext);
  if (!context) {
    throw new Error('SelectWithCombobox parts must be used within SelectWithCombobox.Root');
  }
  return context;
}

function Root<T extends Value = Value>({
  defaultOpen,
  open,
  onOpenChange,
  searchValue,
  onSearchValueChange,
  defaultSearchValue,
  defaultSelectedValue,
  selectedValue,
  onSelectedValueChange,
  children,
}: SelectWithComboboxProviderProps<T>) {
  // `open` is only ever passed by the always-open (inline list) consumers.
  const inline = open !== undefined;

  const [popoverOpen, setPopoverOpen] = useState(defaultOpen ?? false);
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue ?? '');
  const search = searchValue ?? internalSearch;

  const value = selectedValue ?? defaultSelectedValue;
  const isMultiple = Array.isArray(value);

  const setSearch = useCallback(
    (next: string) => {
      setInternalSearch(next);
      onSearchValueChange?.(next);
    },
    [onSearchValueChange],
  );

  // Reset the search whenever an item is checked or unchecked, and whenever the popover hides.
  // Read through a ref so a caller passing an unstable onSearchValueChange cannot make this fire
  // on every render and wipe what is being typed.
  const setSearchRef = useRef(setSearch);
  setSearchRef.current = setSearch;
  useEffect(() => {
    setSearchRef.current('');
  }, [selectedValue, popoverOpen]);

  const isChecked = useCallback(
    (itemValue: string) => (Array.isArray(value) ? value.includes(itemValue) : value === itemValue),
    [value],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      if (Array.isArray(value)) {
        const next = value.includes(itemValue) ? value.filter((v) => v !== itemValue) : [...value, itemValue];
        onSelectedValueChange?.(next as T);
        return;
      }
      onSelectedValueChange?.(itemValue as T);
      // Single select behaves like a plain select: picking a value dismisses the popover.
      setPopoverOpen(false);
      onOpenChange?.(false);
    },
    [value, onSelectedValueChange, onOpenChange],
  );

  // Mirrors the previous behaviour: with no selected value at all, the first selectable item
  // becomes the selection as soon as it mounts.
  const autoSelectedRef = useRef(false);
  const latest = useRef({ value, onSelectedValueChange });
  latest.current = { value, onSelectedValueChange };

  const reportItem = useCallback((itemValue: string, disabled: boolean) => {
    if (autoSelectedRef.current) return;
    if (latest.current.value !== undefined) {
      autoSelectedRef.current = true;
      return;
    }
    if (disabled) return;
    autoSelectedRef.current = true;
    latest.current.onSelectedValueChange?.(itemValue as never);
  }, []);

  const context = useMemo<SelectWithComboboxContextValue>(
    () => ({ search, setSearch, isMultiple, isChecked, toggle, reportItem }),
    [search, setSearch, isMultiple, isChecked, toggle, reportItem],
  );

  return (
    <SelectWithComboboxContext.Provider value={context}>
      {inline ? (
        // cmdk needs to wrap the input and the list. In popover mode that wrapper lives inside
        // the portal (see `Popover`), because cmdk's keyboard navigation walks the DOM and cannot
        // see portalled items.
        <CommandRoot>{children}</CommandRoot>
      ) : (
        <PopoverPrimitive.Root
          open={popoverOpen}
          onOpenChange={(next) => {
            setPopoverOpen(next);
            onOpenChange?.(next);
          }}
        >
          {children}
        </PopoverPrimitive.Root>
      )}
    </SelectWithComboboxContext.Provider>
  );
}

function CommandRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  // Filtering is the consumer's job (every call site pre-filters with matchSorter), so cmdk only
  // provides roving keyboard navigation and the listbox roles.
  return (
    <Command shouldFilter={false} className={className}>
      {children}
    </Command>
  );
}

type SelectProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof selectTrigger>;

const Select = forwardRef<HTMLButtonElement, SelectProps>(function SelectWithComboboxTrigger(
  { className, border = 'square', borderColor = 'greyfigma-90', disabled, children, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      // selectTrigger styles the disabled state off `data-disabled`.
      {...(disabled ? { 'data-disabled': '' } : {})}
      className={cn(
        'group',
        selectTrigger({ border, borderColor, backgroundColor: disabled ? 'disabled' : 'enabled' }),
        className,
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
});

function Arrow({ className, ...props }: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <Icon
      icon="arrow-2-down"
      className={cn(
        'pointer-events-none flex items-center justify-center text-[24px] group-aria-expanded:rotate-180',
        className,
      )}
      {...props}
    />
  );
}

type PopoverProps = Omit<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'asChild'> & {
  /** Accepted for compatibility: radix unmounts the content on close by default. */
  unmountOnHide?: boolean;
  /** Accepted for compatibility: radix collision detection provides the available-height var. */
  fitViewport?: boolean;
};

const Popover = forwardRef<HTMLDivElement, PopoverProps>(function SelectWithComboboxPopover(
  { className, unmountOnHide: _unmountOnHide, fitViewport: _fitViewport, children, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={8}
        onOpenAutoFocus={(event) => {
          // Let the combobox input keep focus instead of the popover container.
          event.preventDefault();
        }}
        className={cn(
          'bg-surface-card border-grey-border max-h-[min(var(--radix-popover-content-available-height),300px)] rounded-sm border shadow-md',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      >
        <CommandRoot className="flex min-h-0 flex-col">{children}</CommandRoot>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});

type ComboboxProps = Omit<React.ComponentPropsWithoutRef<typeof Command.Input>, 'value' | 'onValueChange'> & {
  /** Renders the input as the given element, mirroring the previous polymorphic `render` prop. */
  render?: ReactElement;
  /** Accepted for compatibility: cmdk always activates the first matching item. */
  autoSelect?: boolean | 'always';
};

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { render, autoSelect: _autoSelect, ...props },
  ref,
) {
  const { search, setSearch } = useSelectWithComboboxContext();

  if (render && isValidElement(render)) {
    return (
      <Command.Input ref={ref} value={search} onValueChange={setSearch} {...props} asChild>
        {cloneElement(render)}
      </Command.Input>
    );
  }

  return <Command.Input ref={ref} value={search} onValueChange={setSearch} {...props} />;
});

type ComboboxListProps = React.ComponentPropsWithoutRef<typeof ScrollAreaV2>;

const ComboboxList = forwardRef<HTMLDivElement, ComboboxListProps>(function ComboboxList({ children, ...props }, ref) {
  return (
    <ScrollAreaV2 ref={ref} {...props}>
      <Command.List>{children}</Command.List>
    </ScrollAreaV2>
  );
});

export interface ComboboxItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  keywords?: string[];
}

const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(function ComboboxItem(
  { className, value, disabled, children, keywords, ...props },
  ref,
) {
  const { isMultiple, isChecked, toggle, reportItem } = useSelectWithComboboxContext();
  const checked = isChecked(value);

  useEffect(() => {
    reportItem(value, disabled ?? false);
  }, [reportItem, value, disabled]);

  return (
    <Command.Item value={value} disabled={disabled} keywords={keywords} onSelect={() => toggle(value)} asChild>
      {/*
       * cmdk writes `aria-selected` for the *active* (keyboard-highlighted) item and applies it
       * after spreading caller props, so it cannot be overridden through Command.Item. Rendering
       * the item through `asChild` lets this element win, because radix Slot gives child props
       * precedence -- so `aria-selected` keeps its ARIA meaning of "checked", and the keyboard
       * highlight is styled off cmdk's `data-selected` instead.
       */}
      <div
        ref={ref}
        aria-selected={checked}
        className={cn(
          'data-[selected=true]:bg-purple-background-light group flex flex-row items-center gap-sm rounded-sm p-sm',
          className,
        )}
        {...props}
      >
        {isMultiple ? (
          <span
            className={cn(
              'bg-surface-card border-grey-border flex shrink-0 items-center justify-center overflow-hidden rounded-xs border outline-hidden',
              'group-aria-disabled:bg-grey-border group-aria-disabled:text-grey-primary',
              'group-aria-selected:text-grey-white group-aria-selected:border-purple-primary group-aria-selected:bg-purple-primary',
            )}
          >
            <Icon icon="tick" className={checked ? undefined : 'invisible'} />
          </span>
        ) : null}
        {children || value}
      </div>
    </Command.Item>
  );
});

/**
 * @deprecated Use MenuCommand instead.
 *
 * Backed by radix Popover + cmdk. It survives only because MenuCommand has no equivalent of the
 * always-open (inline list) mode that the filter panels rely on; migrating those means moving
 * their two host components (FiltersDropdownMenu and FilterPopover) onto MenuCommand as well.
 */
export const SelectWithCombobox = {
  Root,
  Select,
  Arrow,
  Popover,
  Combobox,
  ComboboxList,
  ComboboxItem,
};
