import * as Ariakit from '@ariakit/react';
import { type Direction } from '@radix-ui/react-scroll-area';
import { type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { createContext, forwardRef, useContext, useEffect } from 'react';
import { Arrow2Down, Tick } from 'ui-icons';

import { ScrollArea } from '../ScrollArea/ScrollArea';
import { selectTrigger } from '../Select/Select';

type Value = string | string[];
export interface SelectWithComboboxProviderProps<T extends Value = Value> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  defaultSearchValue?: string;
  selectedValue?: T;
  onSelectedValueChange?: (value: T) => void;
  defaultSelectedValue?: T;
  children: React.ReactNode;
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
  const combobox = Ariakit.useComboboxStore({
    defaultOpen,
    open,
    setOpen: onOpenChange,
    value: searchValue,
    setValue: onSearchValueChange,
    defaultValue: defaultSearchValue,
    resetValueOnHide: true,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    value: selectedValue,
    setValue: onSelectedValueChange,
    defaultValue: defaultSelectedValue,
  });
  const selectValue = select.useState('value');

  // Reset the combobox value whenever an item is checked or unchecked.
  useEffect(() => combobox.setValue(''), [selectValue, combobox]);

  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.SelectProvider store={select}>{children}</Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

const Select = forwardRef<
  HTMLButtonElement,
  Ariakit.SelectProps & VariantProps<typeof selectTrigger>
>(function SelectWithComboboxPopoverTrigger(
  { className, border = 'square', borderColor = 'grey-10', ...props },
  ref,
) {
  return (
    <Ariakit.Select
      ref={ref}
      className={clsx(
        'group',
        selectTrigger({ border, borderColor }),
        className,
      )}
      {...props}
    />
  );
});

const Arrow = forwardRef<HTMLSpanElement, Ariakit.SelectArrowProps>(
  function SelectWithComboboxArrow({ className, ...props }, ref) {
    return (
      <Ariakit.SelectArrow
        ref={ref}
        {...props}
        render={
          <Arrow2Down className="pointer-events-none flex items-center justify-center text-[24px] group-aria-expanded:rotate-180" />
        }
      />
    );
  },
);

const WithPopover = createContext<boolean>(false);
WithPopover.displayName = 'WithPopover';

const Popover = forwardRef<HTMLDivElement, Ariakit.SelectPopoverProps>(
  function SelectWithComboboxPopover({ className, ...props }, ref) {
    return (
      <WithPopover.Provider value={true}>
        <Ariakit.SelectPopover
          ref={ref}
          fitViewport
          gutter={8}
          className={clsx(
            'animate-slideUpAndFade bg-grey-00 border-grey-10 max-h-[min(var(--popover-available-height),_300px)] rounded border shadow-md will-change-[transform,opacity]',
            className,
          )}
          render={({ children, dir, ...props }) => (
            <ScrollArea.Root dir={dir as Direction} {...props}>
              {children}
              <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          )}
          {...props}
        />
      </WithPopover.Provider>
    );
  },
);

const ComboboxList = forwardRef<HTMLDivElement, Ariakit.ComboboxListProps>(
  function ComboboxList(props, ref) {
    const value = useContext(WithPopover);
    return (
      <Ariakit.ComboboxList
        ref={ref}
        render={value ? <ScrollArea.Viewport /> : undefined}
        {...props}
      />
    );
  },
);

export interface ComboboxItemProps extends Ariakit.SelectItemProps {
  children?: React.ReactNode;
}

const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    const store = Ariakit.useSelectContext();
    const value = store?.useState('value');
    const isMultiple = Array.isArray(value);
    return (
      // Here we're combining both SelectItem and ComboboxItem into the same
      // element. SelectItem adds the multi-selectable attributes to the element
      // (for example, aria-selected).
      <Ariakit.SelectItem
        ref={ref}
        {...props}
        className={clsx(
          'data-[active-item]:bg-purple-05 group flex flex-row items-center gap-2 rounded p-2',
          props.className,
        )}
        render={<Ariakit.ComboboxItem render={props.render} />}
      >
        {isMultiple ? (
          <Ariakit.SelectItemCheck
            className={clsx(
              'bg-grey-00 border-grey-10 flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm border outline-none',
              'group-aria-disabled:bg-grey-10 group-aria-disabled:text-grey-100',
              'group-aria-selected:text-grey-00 group-aria-selected:border-purple-100 group-aria-selected:bg-purple-100',
            )}
          >
            <Tick />
          </Ariakit.SelectItemCheck>
        ) : null}
        {props.children || props.value}
      </Ariakit.SelectItem>
    );
  },
);

export const SelectWithCombobox = {
  Root,
  Label: Ariakit.SelectLabel,
  Select,
  Arrow,
  Popover,
  Combobox: Ariakit.Combobox,
  ComboboxList,
  ComboboxItem,
};
