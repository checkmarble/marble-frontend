import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import { forwardRef, useEffect } from 'react';
import { Tick } from 'ui-icons';

export interface SelectWithComboboxProviderProps {
  open?: boolean;
  label?: string;
  searchValue?: string;
  setSearchValue?: (value: string) => void;
  defaultSearchValue?: string;
  selectedValues?: string[];
  onSelectedValuesChange?: (values: string[]) => void;
  defaultSelectedValues?: string[];
  children: React.ReactNode;
}

function SelectWithComboboxProvider({
  open,
  searchValue,
  setSearchValue,
  defaultSearchValue,
  defaultSelectedValues,
  selectedValues,
  onSelectedValuesChange,
  children,
}: SelectWithComboboxProviderProps) {
  const combobox = Ariakit.useComboboxStore();
  const select = Ariakit.useSelectStore({ combobox });
  const selectValue = select.useState('value');

  // Reset the combobox value whenever an item is checked or unchecked.
  useEffect(() => combobox.setValue(''), [selectValue, combobox]);

  return (
    <Ariakit.ComboboxProvider
      open={open}
      store={combobox}
      value={searchValue}
      setValue={setSearchValue}
      defaultValue={defaultSearchValue}
      resetValueOnHide
    >
      <Ariakit.SelectProvider
        store={select}
        value={selectedValues}
        setValue={onSelectedValuesChange}
        defaultValue={defaultSelectedValues}
      >
        {children}
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

export interface ComboboxItemProps extends Ariakit.SelectItemProps {
  children?: React.ReactNode;
}

const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
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
        <Ariakit.SelectItemCheck
          className={clsx(
            'bg-grey-00 border-grey-10 flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm border outline-none',
            'group-aria-disabled:bg-grey-10 group-aria-disabled:text-grey-100',
            'group-aria-selected:text-grey-00 group-aria-selected:border-purple-100 group-aria-selected:bg-purple-100',
          )}
        >
          <Tick />
        </Ariakit.SelectItemCheck>
        {props.children || props.value}
      </Ariakit.SelectItem>
    );
  },
);

export const SelectWithCombobox = {
  Provider: SelectWithComboboxProvider,
  Combobox: Ariakit.Combobox,
  ComboboxList: Ariakit.ComboboxList,
  ComboboxItem,
};
