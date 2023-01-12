import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from './Select';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

describe('Select', () => {
  it('should render successfully', async () => {
    const mockedOnValueChanged = jest.fn();
    render(
      <Select.Default
        placeholder="Select a value..."
        onValueChange={mockedOnValueChanged}
      >
        {fruits.map((fruit) => {
          return (
            <Select.DefaultItem key={fruit} value={fruit}>
              {fruit}
            </Select.DefaultItem>
          );
        })}
      </Select.Default>
    );

    expect(screen.getByText('Select a value...')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox'));

    fruits.forEach((fruit) =>
      expect(screen.getByText(fruit)).toBeInTheDocument()
    );
    await userEvent.click(screen.getByText('apple'));

    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(mockedOnValueChanged).toHaveBeenCalledWith('apple');
  });
});
