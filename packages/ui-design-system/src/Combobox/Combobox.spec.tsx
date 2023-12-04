import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';

import { Combobox } from './Combobox';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

function DefaultCombobox() {
  const [inputValue, setInputValue] = useState('');

  return (
    <Combobox.Root>
      <Combobox.Input onChange={(event) => setInputValue(event.target.value)} />
      <Combobox.Options>
        {fruits
          .filter((fruit) => fruit.includes(inputValue))
          .map((fruit) => (
            <Combobox.Option key={fruit} value={fruit}>
              {fruit}
            </Combobox.Option>
          ))}
      </Combobox.Options>
    </Combobox.Root>
  );
}

describe('Combobox', () => {
  it('should render successfully', async () => {
    render(<DefaultCombobox />);

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveValue('');

    await userEvent.type(combobox, 'a');

    fruits.forEach((fruit) =>
      fruit.includes('a')
        ? expect(screen.queryByText(fruit)).toBeInTheDocument()
        : expect(screen.queryByText(fruit)).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('apple'));

    expect(combobox).toHaveValue('apple');
  });
});
