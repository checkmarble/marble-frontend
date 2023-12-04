import { clsx } from 'clsx';
import {
  type DateRange,
  DayPicker,
  type DayPickerRangeProps,
  type DayPickerSingleProps,
} from 'react-day-picker';
import { ArrowLeft, ArrowRight } from 'ui-icons';

import { CtaClassName } from '../Button/Button';

export type CalendarProps = DayPickerSingleProps | DayPickerRangeProps;

export type { DateRange };

export function Calendar({
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      classNames={{
        months: 'flex gap-4',
        month: 'flex flex-col gap-4',
        caption: 'bloc relative text-center',
        caption_label:
          'text-grey-100 text-s font-medium capitalize items-center whitespace-nowrap h-10 flex justify-center',
        nav: 'absolute inset-0',
        nav_button: clsx(
          CtaClassName({
            variant: 'secondary',
            color: 'grey',
          }),
          'w-10 h-10',
        ),
        nav_button_previous: 'absolute left-0',
        nav_button_next: 'absolute right-0',
        nav_icon: 'text-l absolute m-auto',
        table: 'w-full border-none',
        head_row: 'flex w-full',
        head_cell:
          'flex items-center justify-center h-12 w-12 text-xs font-semibold text-grey-100',
        tbody: 'border-none',
        row: 'flex w-full',
        cell: 'flex p-0 text-grey-100',
        day: 'h-12 w-12 text-s font-medium relative outline-1 outline-purple-100',
        day_selected: clsx(
          'transition-colors',
          props.mode === 'single' && 'rounded bg-purple-100 text-grey-00 ',
        ),
        day_range_start: 'text-grey-00 bg-purple-100 rounded-s',
        day_range_end: 'text-grey-00 bg-purple-100 rounded-e',
        day_range_middle: 'text-purple-100 bg-purple-05',
        day_outside: 'text-grey-25',
        day_disabled: 'text-grey-10',
        day_today:
          'after:absolute after:bottom-0 after:left-0 after:right-0 after:content-["."] after:text-l',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ArrowLeft,
        IconRight: ArrowRight,
      }}
      {...props}
    />
  );
}
