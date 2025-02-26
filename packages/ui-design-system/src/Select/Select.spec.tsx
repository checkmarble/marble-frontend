import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';

import { Select } from './Select';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

describe('Select', () => {
  it('should render successfully', async () => {
    const mockedOnValueChanged = vi.fn();
    render(
      <Select.Default placeholder="Select a value..." onValueChange={mockedOnValueChanged}>
        {fruits.map((fruit) => {
          return (
            <Select.DefaultItem key={fruit} value={fruit}>
              {fruit}
            </Select.DefaultItem>
          );
        })}
      </Select.Default>,
    );

    const combobox = screen.getByRole('combobox');

    expect(within(combobox).getByText('Select a value...')).toBeInTheDocument();

    await userEvent.click(combobox);

    fruits.forEach((fruit) => expect(screen.getByText(fruit)).toBeInTheDocument());
    await userEvent.click(screen.getByText('apple'));

    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(mockedOnValueChanged).toHaveBeenCalledWith('apple');
  });
});
