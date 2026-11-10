import { Button } from 'ui-design-system';

export interface SelectableValue {
  value: number;
  label: string;
}

export function SelectableValues({
  options,
  selected,
  onChange,
  disabled = false,
}: {
  options: readonly SelectableValue[];
  selected: readonly number[];
  onChange: (values: number[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {options.map(({ value, label }) => {
        const isSelected = selected.includes(value);

        return (
          <Button
            key={value}
            type="button"
            variant={isSelected ? 'primary' : 'secondary'}
            appearance="filter"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => {
              const next = new Set(selected);
              if (isSelected) next.delete(value);
              else next.add(value);
              onChange([...next].sort((a, b) => a - b));
            }}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

export function getWeekdayOptions(locale: string): SelectableValue[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

  return Array.from({ length: 7 }, (_, index) => ({
    value: index + 1,
    label: formatter.format(new Date(Date.UTC(2024, 0, 8 + index))),
  }));
}
