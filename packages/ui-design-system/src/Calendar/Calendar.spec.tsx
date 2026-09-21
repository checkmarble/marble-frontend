import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, type DateRange } from './Calendar';

describe('Calendar', () => {
  it('selects a day and preserves the selection when navigating months', async () => {
    const user = userEvent.setup();
    function SingleCalendar() {
      const [selected, setSelected] = useState<Date>();
      return <Calendar mode="single" defaultMonth={new Date(2026, 0)} selected={selected} onSelect={setSelected} />;
    }
    render(<SingleCalendar />);

    await user.click(screen.getByRole('button', { name: 'Thursday, January 15th, 2026' }));
    expect(screen.getByRole('button', { name: 'Thursday, January 15th, 2026, selected' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to the Next Month' }));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to the Previous Month' }));
    expect(screen.getByRole('button', { name: 'Thursday, January 15th, 2026, selected' })).toBeInTheDocument();
  });

  it('selects both ends of a date range', async () => {
    const user = userEvent.setup();
    function RangeCalendar() {
      const [selected, setSelected] = useState<DateRange>();
      return <Calendar mode="range" defaultMonth={new Date(2026, 0)} selected={selected} onSelect={setSelected} />;
    }
    render(<RangeCalendar />);

    await user.click(screen.getByRole('button', { name: 'Thursday, January 15th, 2026' }));
    await user.click(screen.getByRole('button', { name: 'Sunday, January 18th, 2026' }));
    for (const name of [
      'Thursday, January 15th, 2026, selected',
      'Friday, January 16th, 2026, selected',
      'Sunday, January 18th, 2026, selected',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('prevents selecting disabled dates and navigating beyond month bounds', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 0)}
        startMonth={new Date(2026, 0)}
        endMonth={new Date(2026, 0)}
        disabled={{ before: new Date(2026, 0, 15) }}
        onSelect={onSelect}
      />,
    );

    const disabledDay = screen.getByRole('button', { name: 'Wednesday, January 14th, 2026' });
    expect(disabledDay).toBeDisabled();
    await user.click(disabledDay);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Go to the Previous Month' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Go to the Next Month' })).toHaveAttribute('aria-disabled', 'true');
  });
});
