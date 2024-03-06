import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useDeferredValue, useMemo, useState } from 'react';

import { Input } from '../Input/Input';
import {
  MenuButton,
  MenuCombobox,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
} from './MenuWithCombobox';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

function MenuWithCombobox() {
  const [searchValue, setSearchValue] = useState('');
  const deferredValue = useDeferredValue(searchValue);

  const matches = useMemo(() => {
    if (!deferredValue) return null;
    return fruits.filter((fruit) => fruit.includes(deferredValue));
  }, [deferredValue]);

  const items = matches ?? fruits;

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton>Open</MenuButton>
      <MenuPopover className="flex flex-col gap-2 p-2">
        <MenuCombobox
          render={<Input className="shrink-0" placeholder="Search..." />}
        />
        <MenuContent>
          {items.map((item) => (
            <MenuItem key={item}>{item}</MenuItem>
          ))}
        </MenuContent>
      </MenuPopover>
    </MenuRoot>
  );
}

describe('MenuWithCombobox', () => {
  it('should select element on click', async () => {
    render(<MenuWithCombobox />);

    await userEvent.click(screen.getByText('Open'));

    const fruitOptions = screen.getAllByRole('option');
    fruitOptions.forEach((fruitOption) =>
      expect(fruitOption).toBeInTheDocument(),
    );

    // Click on an option
    await userEvent.click(fruitOptions[0]);

    // Menu should be closed and the content should not be visible
    fruitOptions.forEach((fruitOption) =>
      expect(fruitOption).not.toBeInTheDocument(),
    );
  });

  it('should filter elements', async () => {
    render(<MenuWithCombobox />);

    await userEvent.click(screen.getByText('Open'));

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
