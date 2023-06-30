import { Cross } from '@marble-front/ui/icons';
import { clsx } from 'clsx';
import { useCombobox, type UseComboboxProps } from 'downshift';
import { useId } from 'react';

import { Input } from '../Input/Input';

export interface ComboBoxProps<Item> extends UseComboboxProps<Item> {
  itemToKey: (item: Item) => string;
  renderItemInList: (props: {
    item: Item;
    isSelected: boolean;
    isHighlighted: boolean;
  }) => React.ReactNode;
  placeholder?: string;
  inputRef: React.Ref<HTMLInputElement>;
}

export function ComboBox<Item>({
  itemToKey,
  renderItemInList,
  placeholder,
  id,
  items,
  inputRef,
  ...otherProps
}: ComboBoxProps<Item>) {
  const internalId = useId();
  const computedId = id ?? `combobox-${internalId}`;

  const cb = useCombobox<Item>({
    id: computedId,
    items,
    ...otherProps,
  });

  const displayMenu = cb.isOpen && items.length > 0;

  const inputProps = cb.getInputProps({ id, placeholder, ref: inputRef });

  return (
    <div className="relative">
      <div className="group/input relative max-w-xs">
        <Input
          {...inputProps}
          endAdornment={
            <button
              className="hover:text-grey-100 pointer-events-auto opacity-20 transition-colors duration-200 ease-in-out group-hover/input:opacity-100"
              onClick={() => {
                cb.reset();
              }}
            >
              <Cross />
            </button>
          }
        />
      </div>
      <ul
        {...cb.getMenuProps({
          className: clsx(
            'mt-1 text-s text-grey-100 divide-night-100 bg-grey-00 border-grey-10 absolute z-10 max-h-[336px] w-fit divide-y divide-solid rounded border shadow-md overflow-y-auto overflow-x-hidden',
            { hidden: !displayMenu }
          ),
        })}
      >
        {displayMenu
          ? items.map((item, index) => (
              <li
                className="cursor-pointer"
                key={itemToKey(item)}
                {...cb.getItemProps({ item: item, index })}
              >
                {renderItemInList({
                  item,
                  isSelected: cb.selectedItem === item,
                  isHighlighted: cb.highlightedIndex === index,
                })}
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}

export default ComboBox;
