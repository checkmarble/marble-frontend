import { useState } from 'react';
import { cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type PickerOption = {
  value: string;
  label: string;
  /** Secondary text, searched too (a path, a description). */
  hint?: string;
};

type OptionPickerProps = {
  value: string | undefined;
  options: readonly PickerOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder: string;
  /** When set, the list has a search box with this placeholder. */
  searchPlaceholder?: string;
  emptyLabel?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * A single choice among options, on `MenuCommand`. A value that is not among the options (a table
 * that left the data model, a code no list offers) is shown as it is: it is never silently replaced.
 */
export function OptionPicker({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  hasError = false,
  disabled = false,
  className,
}: OptionPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const shown = selected?.label ?? value;

  return (
    // `className` sizes the picker as a flex or grid item: the select button fills this wrapper.
    <div className={cn('min-w-0', className)}>
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton
            size="medium"
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(hasError && 'border-red-primary')}
          >
            <span className={cn('truncate text-start', !shown && 'text-grey-placeholder')}>{shown || placeholder}</span>
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" className="mt-xs">
          {searchPlaceholder ? <MenuCommand.Combobox placeholder={searchPlaceholder} /> : null}
          <MenuCommand.List>
            {emptyLabel ? (
              <MenuCommand.Empty className="text-s text-grey-secondary p-sm text-center">
                {emptyLabel}
              </MenuCommand.Empty>
            ) : null}
            {options.map((option) => (
              <MenuCommand.Item
                key={option.value}
                value={option.value}
                keywords={[option.label, option.hint ?? '']}
                className="h-auto min-h-10"
                onSelect={() => onChange(option.value)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.hint ? <span className="text-grey-secondary truncate text-xs">{option.hint}</span> : null}
                </span>
                {option.value === value ? <Icon icon="tick" className="text-purple-primary size-5 shrink-0" /> : null}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
