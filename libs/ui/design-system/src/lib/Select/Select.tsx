import * as ScrollArea from '@radix-ui/react-scroll-area';
import clsx from 'clsx';
import { useSelect, type UseSelectProps } from 'downshift';

/* eslint-disable-next-line */
export interface SelectProps {}

export function Select(
  props: UseSelectProps<{ author: string; title: string }>
) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect(props);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <label {...getLabelProps()}>Choose your favorite book:</label>
        <div
          className="border-grey-10 bg-grey-00 flex w-fit cursor-pointer justify-between gap-2 rounded border p-2"
          {...getToggleButtonProps()}
        >
          <span>{selectedItem ? selectedItem.title : 'Elements'}</span>
          <span>{isOpen ? <>&#8593;</> : <>&#8595;</>}</span>
        </div>
      </div>
      <ScrollArea.Root className="bg-grey-00 absolute w-fit overflow-hidden shadow-md">
        <ScrollArea.Viewport>
          <ul {...getMenuProps()} className="max-h-72">
            {isOpen &&
              props.items.map((item, index) => (
                <li
                  className={clsx('flex flex-col py-2 px-3 shadow-sm', {
                    'bg-purple-50': highlightedIndex === index,
                    'font-bold': selectedItem === item,
                  })}
                  key={`${props.itemToString?.(item)}${index}`}
                  {...getItemProps({ item, index })}
                >
                  <span>{item.title}</span>
                  <span className="text-sm text-gray-700">{item.author}</span>
                </li>
              ))}
          </ul>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="bg-grey-02 flex w-2 touch-none select-none p-0.5 transition"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="bg-grey-10 relative flex-1 rounded-lg" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

export default Select;
