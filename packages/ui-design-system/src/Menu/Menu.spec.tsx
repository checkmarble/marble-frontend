import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useDeferredValue, useMemo, useState } from 'react';

import { Input } from '../Input/Input';
import { MenuButton, MenuCombobox, MenuContent, MenuItem, MenuPopover, MenuRoot } from './Menu';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

function Menu() {
  return (
    <MenuRoot>
      <MenuButton>Open</MenuButton>
      <MenuPopover className="flex flex-col gap-2 p-2">
        {fruits.map((item) => (
          <MenuItem key={item}>{item}</MenuItem>
        ))}
      </MenuPopover>
    </MenuRoot>
  );
}

describe('Menu', () => {
  it('should select element on click', async () => {
    render(<Menu />);

    await userEvent.click(screen.getByText('Open'));

    fruits.forEach((fruit) =>
      expect(screen.getByRole('menuitem', { name: fruit })).toBeInTheDocument(),
    );
    const firstItem = screen.getByRole('menuitem', { name: fruits[0] });
    expect(firstItem).toBeDefined();
    if (!firstItem) return;

    // Click on an option
    await userEvent.click(firstItem);

    expect(screen.queryByRole('button', { name: 'Open' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

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
        <MenuCombobox render={<Input className="shrink-0" placeholder="Search..." />} />
        <MenuContent>
          {items.map((item) => (
            <MenuItem key={item}>{item}</MenuItem>
          ))}
        </MenuContent>
      </MenuPopover>
    </MenuRoot>
  );
}

describe('Menu with combobox', () => {
  it('should select element on click', async () => {
    render(<MenuWithCombobox />);

    await userEvent.click(screen.getByText('Open'));

    fruits.forEach((fruit) =>
      expect(screen.getByRole('option', { name: fruit })).toBeInTheDocument(),
    );
    const firstItem = screen.getByRole('option', { name: fruits[0] });
    expect(firstItem).toBeDefined();
    if (!firstItem) return;

    // Click on an option
    await userEvent.click(firstItem);

    expect(screen.queryByRole('button', { name: 'Open' })).toHaveAttribute(
      'aria-expanded',
      'false',
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
