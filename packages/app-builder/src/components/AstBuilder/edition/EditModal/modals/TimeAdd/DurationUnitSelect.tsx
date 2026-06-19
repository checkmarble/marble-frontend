import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

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
    <SelectV2<DurationUnit | undefined>
      disabled={disabled}
      value={value ?? undefined}
      onChange={(selectedValue) => {
        if (selectedValue === undefined) return;
        onChange(selectedValue);
      }}
      placeholder="..."
      className="min-w-fit"
      options={options.map((option) => ({
        label: <span className="text-s text-grey-primary">{t(`scenarios:edit_date.duration_unit_${option}`)}</span>,
        value: option,
      }))}
    />
  );
}
