import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ComboBox from './ComboBox';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

describe('ComboBox', () => {
  it('should render successfully', async () => {
    render(
      <ComboBox
        items={fruits}
        itemToKey={(fruit) => fruit}
        itemToString={(fruit) => fruit ?? ''}
        renderItemInList={({ item: fruit }) => fruit}
      />
    );
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveValue('');

    await userEvent.click(combobox);

    fruits.forEach((fruit) =>
      expect(screen.getByText(fruit)).toBeInTheDocument()
    );
    await userEvent.click(screen.getByText('apple'));

    expect(combobox).toHaveValue('apple');
  });
});
