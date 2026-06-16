import { useFormatDateTime } from '@app-builder/utils/format';
import { type ElementRef, forwardRef, useState } from 'react';
import { Button, Calendar, cn, type Input, Popover } from 'ui-design-system';
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
  const formatDateTime = useFormatDateTime();

  return (
    <div ref={ref} className="flex flex-row items-center gap-2">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button variant="secondary" size="medium">
            <Icon
              icon="calendar-month"
              className={cn('size-5', selectedDate ? 'text-grey-primary' : 'text-grey-secondary')}
            />
            <span className={cn('font-normal', selectedDate ? 'text-grey-primary' : 'text-grey-secondary')}>
              {selectedDate ? formatDateTime(selectedDate, { dateStyle: 'short' }) : props.placeholder}
            </span>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          className="bg-surface-card border-grey-border isolate rounded-md border p-4"
          align="start"
          sideOffset={2}
          side="bottom"
        >
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
        </Popover.Content>
      </Popover.Root>
    </div>
  );
});
