import * as Ariakit from '@ariakit/react';
import type { VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, useEffect } from 'react';
import { Icon } from 'ui-icons';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';
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
  { className, border = 'square', borderColor = 'greyfigma-90', disabled, ...props },
  ref,
) {
  return (
    <Ariakit.Select
      ref={ref}
      className={clsx(
        'group',
        selectTrigger({
          border,
          borderColor,
          backgroundColor: disabled ? 'disabled' : 'enabled',
        }),
        className,
      )}
      disabled={disabled}
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
          <Icon
            icon="arrow-2-down"
            // @ariakit/react inject width: 1em; height: 1em; into the style so use text-[24px] instead of size-6
            className="pointer-events-none flex items-center justify-center text-[24px] group-aria-expanded:rotate-180"
          />
        }
      />
    );
  },
);

const Popover = forwardRef<HTMLDivElement, Ariakit.SelectPopoverProps>(
  function SelectWithComboboxPopover({ className, ...props }, ref) {
    return (
      <Ariakit.SelectPopover
        ref={ref}
        fitViewport
        gutter={8}
        className={clsx(
          'bg-grey-100 border-grey-90 max-h-[min(var(--popover-available-height),_300px)] -translate-y-1 rounded border opacity-0 shadow-md transition-all data-[enter]:translate-y-0 data-[enter]:opacity-100',
          className,
        )}
        {...props}
      />
    );
  },
);

const ComboboxList = forwardRef<HTMLDivElement, Ariakit.ComboboxListProps>(
  function ComboboxList(props, ref) {
    return <Ariakit.ComboboxList ref={ref} render={<ScrollAreaV2 />} {...props} />;
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
          'data-[active-item]:bg-purple-98 group flex flex-row items-center gap-2 rounded p-2',
          props.className,
        )}
        render={<Ariakit.ComboboxItem render={props.render} />}
      >
        {isMultiple ? (
          <Ariakit.SelectItemCheck
            className={clsx(
              'bg-grey-100 border-grey-90 flex shrink-0 items-center justify-center overflow-hidden rounded-sm border outline-none',
              'group-aria-disabled:bg-grey-90 group-aria-disabled:text-grey-00',
              'group-aria-selected:text-grey-100 group-aria-selected:border-purple-65 group-aria-selected:bg-purple-65',
            )}
          >
            <Icon icon="tick" />
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
