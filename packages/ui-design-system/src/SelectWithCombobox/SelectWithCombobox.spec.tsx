import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useDeferredValue, useMemo, useState } from 'react';

import Input from '../Input/Input';
import { SelectWithCombobox } from './SelectWithCombobox';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

function SelectFruitWithCombobox() {
  const [value, setSearchValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue]
  );

  return (
    <SelectWithCombobox.Provider
      open
      setSearchValue={setSearchValue}
      selectedValues={selectedValues}
      onSelectedValuesChange={setSelectedValues}
    >
      <SelectWithCombobox.Combobox render={<Input />} autoSelect />
      <SelectWithCombobox.ComboboxList>
        {matches.map((fruit) => {
          return <SelectWithCombobox.ComboboxItem key={fruit} value={fruit} />;
        })}
      </SelectWithCombobox.ComboboxList>
    </SelectWithCombobox.Provider>
  );
}

describe('SelectWithCombobox', () => {
  it('should select element on click', async () => {
    render(<SelectFruitWithCombobox />);

    fruits.forEach((fruit) =>
      expect(screen.getByText(fruit)).toBeInTheDocument()
    );
    const apple = screen.getByRole('option', {
      name: 'apple',
    });

    expect(apple).toHaveAttribute('aria-selected', 'false');

    //select
    await userEvent.click(screen.getByText('apple'));
    expect(apple).toHaveAttribute('aria-selected', 'true');

    //unselect
    await userEvent.click(screen.getByText('apple'));
    expect(apple).toHaveAttribute('aria-selected', 'false');
  });

  it('should filter elements', async () => {
    render(<SelectFruitWithCombobox />);

    const fruitOptions = screen.getAllByRole('option');

    const combobox = screen.getByRole('combobox');
    await userEvent.type(combobox, 'a');

    fruitOptions.forEach((fruitOption) => {
      if (fruitOption.textContent?.includes('a')) {
        expect(fruitOption).toBeInTheDocument();
      } else {
        expect(fruitOption).not.toBeInTheDocument();
      }
    });
  });
});
