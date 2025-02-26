import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { Calendar, type CalendarProps } from './Calendar';

const Demo = ({ mode, ...args }: CalendarProps) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  return (
    <div className="flex flex-col gap-y-4">
      <Calendar
        {...(mode === 'single'
          ? { ...args, mode, selected: date, onSelect: setDate }
          : { ...args, mode, selected: dateRange, onSelect: setDateRange })}
      />

      {mode === 'single' ? (
        <p className="text-m">Selected Date: {date ? date.toDateString() : 'None'}</p>
      ) : null}
      {mode === 'range' ? (
        <p className="text-m">
          Selected Range:{' '}
          {dateRange
            ? [dateRange.from?.toDateString(), dateRange.to?.toDateString() ?? '?'].join(' - ')
            : 'None'}
        </p>
      ) : null}
    </div>
  );
};

const meta: Meta<typeof Calendar> = {
  title: 'Calendar',
  component: Calendar,
  render: Demo,
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Single: Story = {
  args: {
    mode: 'single',
  },
};

export const TwoMonthSingle: Story = {
  args: {
    mode: 'single',
    numberOfMonths: 2,
  },
};

export const Range: Story = {
  args: {
    mode: 'range',
  },
};

export const TwoMonthRange: Story = {
  args: {
    mode: 'range',
    numberOfMonths: 2,
  },
};
