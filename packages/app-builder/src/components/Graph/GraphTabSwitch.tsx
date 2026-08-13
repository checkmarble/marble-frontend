import { cn, Tabs, tabClassName } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

export type TabSwitchOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

/** Pairs a mode list with its translated labels, and optionally an icon per mode. */
export function tabSwitchOptions<T extends string>(
  values: readonly T[],
  getLabel: (value: T) => string,
  icons?: Record<T, IconName>,
): TabSwitchOption<T>[] {
  return values.map((value) => ({ value, label: getLabel(value), icon: icons?.[value] }));
}

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
          className={cn(tabClassName, option.icon && 'gap-xs')}
          data-status={value === option.value ? 'active' : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? <Icon icon={option.icon} className="size-4 shrink-0" /> : null}
          {option.label}
        </button>
      ))}
    </Tabs>
  );
}
