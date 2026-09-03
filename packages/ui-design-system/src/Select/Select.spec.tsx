import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SelectV2 } from './Select';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

describe('Select', () => {
  it('should render successfully', async () => {
    const mockedOnValueChanged = vi.fn();
    function TestSelect() {
      const [value, setValue] = useState('');

      return (
        <SelectV2
          placeholder="Select a value..."
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
            mockedOnValueChanged(nextValue);
          }}
          options={fruits.map((fruit) => ({
            label: fruit,
            value: fruit,
          }))}
        />
      );
    }

    render(<TestSelect />);

    const combobox = screen.getByRole('combobox', { name: 'Select a value...' });

    expect(within(combobox).getByText('Select a value...')).toBeInTheDocument();

    await userEvent.click(combobox);

    fruits.forEach((fruit) => expect(screen.getByText(fruit)).toBeInTheDocument());
    await userEvent.click(screen.getByText('apple'));

    expect(screen.getByRole('combobox', { name: 'apple' })).toBeInTheDocument();
    expect(mockedOnValueChanged).toHaveBeenCalledWith('apple');
  });

  it('passes its ref to the trigger button', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <SelectV2
        ref={ref}
        placeholder="Select a value..."
        value=""
        onChange={vi.fn()}
        options={fruits.map((fruit) => ({ label: fruit, value: fruit }))}
      />,
    );

    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Select a value...' }));
  });
});
