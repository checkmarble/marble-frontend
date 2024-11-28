import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getInputProps, useField, useInputControl } from '@conform-to/react';
import { format } from 'date-fns';
import { Popover, PopoverDisclosure, PopoverProvider } from '@ariakit/react';
import { Calendar, CtaClassName, type Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { forwardRef, useState, type ElementRef } from 'react';

interface FormDateSelectorProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  name: string;
  description?: string;
}

export const FormDateSelector = forwardRef<
  ElementRef<typeof Input>,
  FormDateSelectorProps
>(function FormDateSelector({ name, description, ...props }, ref) {
  const [field, _] = useField<string>(name);
  const [selectedDate, selectDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const input = useInputControl(field);
  const language = useFormatLanguage();

  const handleSelect = (date?: Date) => {
    if (date) {
      selectDate(date);
      input.change(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        {...getInputProps(field, { type: 'hidden' })}
        ref={ref}
        value={selectedDate ? format(selectedDate, 'PP') : ''}
        readOnly
        {...props}
      />
      <PopoverProvider open={open} setOpen={setOpen}>
        <PopoverDisclosure className={CtaClassName({ variant: 'secondary' })}>
          <Icon icon="calendar-month" className="size-6" />
          <span>
            {selectedDate
              ? formatDateTime(selectedDate, {
                  language,
                  timeStyle: undefined,
                })
              : props.placeholder}
          </span>
        </PopoverDisclosure>
        <Popover
          className="bg-grey-00 border-grey-05 isolate rounded-md border p-4"
          gutter={8}
        >
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
});
