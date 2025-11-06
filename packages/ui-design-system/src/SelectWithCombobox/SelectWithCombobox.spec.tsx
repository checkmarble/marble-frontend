import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useDeferredValue, useMemo, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from '../Input/Input';
import { SelectWithCombobox } from './SelectWithCombobox';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

function SelectFruitWithCombobox() {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => fruits.filter((fruit) => fruit.includes(deferredValue)), [deferredValue]);

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedValues}
      onSelectedValueChange={setSelectedValues}
    >
      <SelectWithCombobox.Select>
        {selectedValues.join(', ') || 'Select fruits...'}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>

      <SelectWithCombobox.Popover className="flex flex-col gap-2 p-2" fitViewport>
        <SelectWithCombobox.Combobox render={<Input className="shrink-0" placeholder="Search..." />} />

        <SelectWithCombobox.ComboboxList>
          {matches.map((fruit) => {
            return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}

describe('SelectWithCombobox', () => {
  it('should select element on click', async () => {
    render(<SelectFruitWithCombobox />);

    await userEvent.click(screen.getByText('Select fruits...'));

    fruits.forEach((fruit) =>
      expect(
        screen.getByRole('option', {
          name: fruit,
        }),
      ).toBeInTheDocument(),
    );
    const apple = screen.getByRole('option', {
      name: 'apple',
    });

    expect(apple).toHaveAttribute('aria-selected', 'false');

    //select
    await userEvent.click(apple);
    expect(apple).toHaveAttribute('aria-selected', 'true');

    //unselect
    await userEvent.click(apple);
    expect(apple).toHaveAttribute('aria-selected', 'false');
  });

  it('should filter elements', async () => {
    render(<SelectFruitWithCombobox />);

    await userEvent.click(screen.getByText('Select fruits...'));

    const fruitOptions = screen.getAllByRole('option');

    const input = screen.getByPlaceholderText('Search...');
    await userEvent.type(input, 'a');

    fruitOptions.forEach((fruitOption) => {
      if (fruitOption.textContent?.includes('a')) {
        expect(fruitOption).toBeInTheDocument();
      } else {
        expect(fruitOption).not.toBeInTheDocument();
      }
    });
  });
});
