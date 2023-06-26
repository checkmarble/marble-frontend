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
}

export function ComboBox<Item>({
  itemToKey,
  renderItemInList,
  placeholder,
  id,
  items,
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

  return (
    <div className="relative">
      <div className="group relative max-w-xs">
        <Input {...cb.getInputProps({ id, placeholder })} />
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
