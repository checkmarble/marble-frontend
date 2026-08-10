import { Button, cn } from 'ui-design-system';

interface SegmentedToggleProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (option: T) => void;
  getLabel: (option: T) => string;
}

export function SegmentedToggle<T extends string>({ options, value, onChange, getLabel }: SegmentedToggleProps<T>) {
  return (
    <div className="flex gap-xs">
      {options.map((option) => (
        <Button
          key={option}
          variant="secondary"
          onClick={() => onChange(option)}
          className={cn(value === option && 'bg-purple-background-light border-purple-primary text-purple-primary')}
        >
          {getLabel(option)}
        </Button>
      ))}
    </div>
  );
}
