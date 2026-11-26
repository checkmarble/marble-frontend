import { type CalendarLabel } from '@app-builder/utils/calendar-labels';
import { Button } from 'ui-design-system';

export function SelectableValues({
  options,
  selected,
  onChange,
}: {
  options: readonly CalendarLabel[];
  selected: readonly number[];
  onChange: (values: number[]) => void;
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
