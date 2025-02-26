import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Popover, PopoverDisclosure, PopoverProvider } from '@ariakit/react';
import { getInputProps, useField, useInputControl } from '@conform-to/react';
import clsx from 'clsx';
import { type ElementRef, forwardRef, useState } from 'react';
import { Button, Calendar, type Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface FormDateSelectorProps extends React.ComponentPropsWithoutRef<typeof Input> {
  name: string;
  description?: string;
}

export const FormDateSelector = forwardRef<ElementRef<typeof Input>, FormDateSelectorProps>(
  function FormDateSelector({ name, description, ...props }, ref) {
    const [field, _] = useField<string>(name);
    const [selectedDate, selectDate] = useState<Date>();
    const [open, setOpen] = useState(false);
    const input = useInputControl(field);
    const language = useFormatLanguage();

    const handleSelect = (date?: Date) => {
      if (date) {
        selectDate(date);
        input.change(date.toISOString());
        setOpen(false);
      }
    };

    return (
      <div className="flex flex-row items-center gap-2">
        <input
          {...getInputProps(field, { type: 'hidden' })}
          ref={ref}
          value={selectedDate?.toISOString()}
          readOnly
          {...props}
        />
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
                ? formatDateTime(selectedDate, {
                    language,
                    timeStyle: undefined,
                  })
                : props.placeholder}
            </span>
          </PopoverDisclosure>
          <Popover className="bg-grey-100 border-grey-95 isolate rounded-md border p-4" gutter={8}>
            <Calendar
              mode="single"
              hidden={{ before: new Date() }}
              selected={selectedDate}
              onSelect={handleSelect}
            />
          </Popover>
        </PopoverProvider>
      </div>
    );
  },
);
