import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import * as React from 'react';

import {
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  ComboboxRoot,
} from './Combobox';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];

function FruitCombobox() {
  const [value, setValue] = React.useState('');
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () => fruits.filter((fruit) => fruit.includes(deferredValue)),
    [deferredValue],
  );

  return (
    <ComboboxRoot setValue={setValue}>
      <ComboboxLabel>Fruits</ComboboxLabel>
      <Combobox />
      <ComboboxPopover hideOnInteractOutside modal>
        {matches.map((fruit) => {
          return <ComboboxItem key={fruit} value={fruit} />;
        })}
      </ComboboxPopover>
    </ComboboxRoot>
  );
}

describe('Combobox', () => {
  it('should select element on click', async () => {
    render(<FruitCombobox />);

    const input = screen.getByLabelText('Fruits');
    await userEvent.click(input);

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

    //select
    await userEvent.click(apple);
    expect(input).toHaveValue('apple');
  });

  it('should filter elements', async () => {
    render(<FruitCombobox />);

    const input = screen.getByLabelText('Fruits');
    await userEvent.click(input);

    const fruitOptions = screen.getAllByRole('option');

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
