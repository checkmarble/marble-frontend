import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { Popover, PopoverDisclosure, PopoverProvider } from '@ariakit/react';
import clsx from 'clsx';
import { type ElementRef, forwardRef, useState } from 'react';
import { Button, Calendar, type Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface DateSelectorProps {
  name: string;
  description?: string;
  placeholder?: string;
  onChange?: (value: Date) => void;
  defaultValue?: Date;
}

export const DateSelector = forwardRef<ElementRef<typeof Input>, DateSelectorProps>(function DateSelector(
  { name, description, ...props },
  ref,
) {
  const [selectedDate, selectDate] = useState<Date | undefined>(props.defaultValue);
  const [open, setOpen] = useState(false);
  const language = useFormatLanguage();

  return (
    <div ref={ref} className="flex flex-row items-center gap-2">
      <PopoverProvider open={open} setOpen={setOpen}>
        <PopoverDisclosure render={<Button variant="secondary" />}>
          <Icon
            icon="calendar-month"
            className={clsx('size-6', {
              'text-grey-00': selectedDate,
              'text-grey-50': !selectedDate,
            })}
          />
          <span
            className={clsx('font-normal', {
              'text-grey-00': selectedDate,
              'text-grey-50': !selectedDate,
            })}
          >
            {selectedDate
              ? formatDateTimeWithoutPresets(selectedDate, {
                  language,
                  dateStyle: 'short',
                })
              : props.placeholder}
          </span>
        </PopoverDisclosure>
        <Popover className="bg-grey-100 border-grey-95 isolate rounded-md border p-4" gutter={8}>
          <Calendar
            mode="single"
            hidden={{ before: new Date() }}
            selected={props.defaultValue}
            onSelect={(date) => {
              if (date) {
                selectDate(date);
                props.onChange?.(date);
                setOpen(false);
              }
            }}
          />
        </Popover>
      </PopoverProvider>
    </div>
  );
});
