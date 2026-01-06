import { clsx } from 'clsx';
import {
  type DateRange,
  DayFlag,
  DayPicker,
  type PropsBase,
  type PropsRange,
  type PropsSingle,
  SelectionState,
  UI,
} from 'react-day-picker';
import { Icon } from 'ui-icons';

import { CtaV2ClassName } from '../Button/Button';

export type CalendarProps = PropsBase & (PropsSingle | PropsRange);

export type { DateRange };

export function Calendar({ classNames, showOutsideDays = true, fixedWeeks = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      classNames={{
        [UI.Months]: 'relative flex gap-4 w-fit',
        [UI.Month]: 'flex flex-col gap-4',
        [UI.MonthCaption]: 'bloc text-center',
        [UI.CaptionLabel]:
          'text-grey-primary text-s font-medium capitalize items-center whitespace-nowrap h-10 flex justify-center',
        [UI.Nav]: 'absolute top-0 left-0 right-0',
        [UI.PreviousMonthButton]: clsx(
          CtaV2ClassName({
            variant: 'secondary',
            mode: 'icon',
          }),
          'size-10 absolute left-0',
        ),
        [UI.NextMonthButton]: clsx(
          CtaV2ClassName({
            variant: 'secondary',
            mode: 'icon',
          }),
          'size-10 absolute right-0',
        ),
        [UI.Chevron]: 'absolute m-auto size-5',
        [UI.MonthGrid]: 'w-full border-none',
        [UI.Weekdays]: 'flex w-full',
        [UI.Weekday]: 'flex items-center justify-center size-12 text-xs font-semibold text-grey-primary',
        [UI.Weeks]: 'border-none',
        [UI.Week]: 'flex w-full',
        [UI.Day]: 'flex p-0',
        [UI.DayButton]: 'size-12 text-default font-medium',
        [SelectionState.selected]: clsx(
          'transition-colors',
          props.mode === 'single' && 'rounded-v2-md bg-purple-primary text-grey-white ',
        ),
        [SelectionState.range_start]: 'text-grey-white bg-purple-primary rounded-s-v2-md',
        [SelectionState.range_end]: 'text-grey-white bg-purple-primary rounded-e-v2-md',
        [SelectionState.range_middle]: 'text-purple-primary bg-purple-background-light',
        [DayFlag.outside]: 'text-grey-disabled',
        [DayFlag.disabled]: 'text-grey-border',
        [DayFlag.today]:
          'after:absolute after:bottom-0 after:left-0 after:right-0 after:content-["."] after:text-l after:text-center relative after:pointer-events-none',
        [DayFlag.hidden]: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => <Icon icon={props.orientation === 'left' ? 'arrow-left' : 'arrow-right'} {...props} />,
      }}
      {...props}
    />
  );
}
