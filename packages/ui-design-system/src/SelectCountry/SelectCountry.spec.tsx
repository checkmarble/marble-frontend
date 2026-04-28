import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SelectCountry, type SelectCountryValue } from './SelectCountry';

mockResizeObserver();

function StatefulSelectCountry({
  onValueChange,
  disabled,
}: {
  onValueChange?: (value: SelectCountryValue | null) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<SelectCountryValue | null>(null);
  return (
    <SelectCountry
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
      disabled={disabled}
    />
  );
}

async function openDropdown() {
  await userEvent.click(screen.getByText('Select country'));
  return screen.getByPlaceholderText('Search country…');
}

describe('SelectCountry', () => {
  it('renders the placeholder when no value is selected', () => {
    render(<StatefulSelectCountry />);
    expect(screen.getByText('Select country')).toBeInTheDocument();
  });

  it('opens the dropdown on trigger click', async () => {
    render(<StatefulSelectCountry />);
    const search = await openDropdown();
    expect(search).toBeInTheDocument();
  });

  it('closes the menu after selecting a country from the list', async () => {
    render(<StatefulSelectCountry />);
    await openDropdown();

    await userEvent.click(screen.getByRole('option', { name: /france/i }));

    expect(screen.queryByPlaceholderText('Search country…')).not.toBeInTheDocument();
  });

  it('displays the selected country name in the trigger after selection', async () => {
    render(<StatefulSelectCountry />);
    await openDropdown();

    await userEvent.click(screen.getByRole('option', { name: /france/i }));

    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('calls onValueChange with the correct country when selected from list', async () => {
    const onValueChange = vi.fn();
    render(<StatefulSelectCountry onValueChange={onValueChange} />);
    await openDropdown();

    await userEvent.click(screen.getByRole('option', { name: /france/i }));

    expect(onValueChange).toHaveBeenCalledWith({
      isoAlpha2: 'FR',
      isoAlpha3: 'FRA',
      name: 'France',
      isManual: false,
    });
  });

  it('filters countries by search using exact substring match', async () => {
    render(<StatefulSelectCountry />);
    const search = await openDropdown();
    await userEvent.type(search, 'france');

    expect(screen.getByRole('option', { name: /france/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /germany/i })).not.toBeInTheDocument();
  });

  it('shows a free-text button when no country matches the search', async () => {
    render(<StatefulSelectCountry />);
    const search = await openDropdown();
    await userEvent.type(search, 'Narnia');

    // FreeTextItem renders with curly quotes: "Narnia"
    expect(screen.getByRole('button', { name: /Narnia/i })).toBeInTheDocument();
  });

  it('selecting the free-text option closes the menu and emits isManual value', async () => {
    const onValueChange = vi.fn();
    render(<StatefulSelectCountry onValueChange={onValueChange} />);
    const search = await openDropdown();

    await userEvent.type(search, 'Narnia');
    await userEvent.click(screen.getByRole('button', { name: /Narnia/i }));

    expect(screen.queryByPlaceholderText('Search country…')).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith({
      isoAlpha2: '',
      isoAlpha3: '',
      name: 'Narnia',
      isManual: true,
    });
  });

  it('displays a free-text country name without a flag in the trigger', async () => {
    const onValueChange = vi.fn();
    render(<StatefulSelectCountry onValueChange={onValueChange} />);
    const search = await openDropdown();

    await userEvent.type(search, 'Narnia');
    await userEvent.click(screen.getByRole('button', { name: /Narnia/i }));

    // Trigger shows the name, no flag emoji before it
    const trigger = screen.getByRole('button', { name: 'Narnia' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toHaveTextContent(/\p{Emoji_Presentation}/u);
  });
});
