import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MenuCommand } from './MenuCommand';

mockResizeObserver();

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple'];

type TestMenuProps = {
  persistOnSelect?: boolean;
  withCombobox?: boolean;
  onSelect?: (value: string) => void;
};

function TestMenu({ persistOnSelect = false, withCombobox = false, onSelect }: TestMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen} persistOnSelect={persistOnSelect}>
      <MenuCommand.Trigger>
        <button type="button">Open</button>
      </MenuCommand.Trigger>
      <MenuCommand.Content>
        {withCombobox ? <MenuCommand.Combobox placeholder="Search..." /> : null}
        <MenuCommand.List>
          {fruits.map((fruit) => (
            <MenuCommand.Item key={fruit} value={fruit} onSelect={() => onSelect?.(fruit)}>
              {fruit}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

describe('MenuCommand', () => {
  it('opens on trigger click and exposes items as options', async () => {
    render(<TestMenu />);

    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    fruits.forEach((fruit) => expect(screen.getByRole('option', { name: fruit })).toBeInTheDocument());
  });

  it('calls onSelect and closes the menu when an item is picked', async () => {
    const onSelect = vi.fn();
    render(<TestMenu onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('option', { name: 'banana' }));

    expect(onSelect).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('keeps the menu open on select when persistOnSelect is set', async () => {
    const onSelect = vi.fn();
    render(<TestMenu persistOnSelect onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('option', { name: 'banana' }));

    expect(onSelect).toHaveBeenCalledWith('banana');
    // Multi-select menus rely on this: picking an item must not dismiss the popover.
    expect(screen.getByRole('option', { name: 'banana' })).toBeInTheDocument();
  });

  it('filters items through the combobox', async () => {
    render(<TestMenu withCombobox />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await userEvent.type(screen.getByPlaceholderText('Search...'), 'berry');

    expect(screen.getByRole('option', { name: 'blueberry' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'apple' })).not.toBeInTheDocument();
  });

  // Pins the `asChild` passthrough: cmdk forwards it to a Radix Primitive, which is what lets
  // navigation menus render real anchors. A cmdk change that drops this would break silently.
  it('renders an item as its child element when asChild is set', async () => {
    render(
      <MenuCommand.Menu defaultOpen>
        <MenuCommand.Trigger>
          <button type="button">Open</button>
        </MenuCommand.Trigger>
        <MenuCommand.Content>
          <MenuCommand.List>
            <MenuCommand.Item asChild value="apple">
              <a href="/apple">apple</a>
            </MenuCommand.Item>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>,
    );

    const option = await screen.findByRole('option', { name: 'apple' });
    expect(option.tagName).toBe('A');
    expect(option).toHaveAttribute('href', '/apple');
  });
});
