import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

const options = ['seconds', 'minutes', 'hours', 'days'] as const;
export type DurationUnit = (typeof options)[number];

type DurationUnitSelectProps = {
  value: DurationUnit | null;
  disabled?: boolean;
  onChange: (value: DurationUnit) => void;
};
export function DurationUnitSelect({ value, disabled, onChange }: DurationUnitSelectProps) {
  const { t } = useTranslation(['scenarios']);

  return (
    <Select.Default
      disabled={disabled}
      value={value ?? undefined}
      onValueChange={(selectedValue: DurationUnit) => {
        if (selectedValue === null) return;
        onChange(selectedValue);
      }}
      placeholder="..."
      className="min-w-fit"
    >
      {options.map((option) => (
        <Select.Item key={option} value={option}>
          <Select.ItemText>
            <span className="text-s text-grey-00">
              {t(`scenarios:edit_date.duration_unit_${option}`)}
            </span>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select.Default>
  );
}
