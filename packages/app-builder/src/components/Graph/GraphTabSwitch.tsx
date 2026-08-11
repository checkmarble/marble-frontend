import { Tabs, tabClassName } from 'ui-design-system';

export type TabSwitchOption<T extends string> = {
  value: T;
  label: string;
};

/** A `Tabs` bar driven by a value, for the graph page's mutually exclusive modes. */
export function GraphTabSwitch<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly TabSwitchOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <Tabs>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={tabClassName}
          data-status={value === option.value ? 'active' : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </Tabs>
  );
}
