import { type EvaluationError } from '@app-builder/models';
import { Select } from '@ui-design-system';
import { useTranslation } from 'react-i18next';

const options = ['seconds', 'minutes', 'hours', 'days'] as const;
export type DurationUnit = (typeof options)[number];

export const DurationUnitSelect = ({
  value,
  onChange,
  validation,
}: {
  value: DurationUnit | null;
  onChange: (value: DurationUnit) => void;
  validation: { errors: EvaluationError[] };
}) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <Select.Default
      value={value ?? undefined}
      onValueChange={(selectedValue: DurationUnit) => {
        if (selectedValue === null) return;
        onChange(selectedValue);
      }}
      placeholder="..."
      className="min-w-fit"
      borderColor={validation.errors.length > 0 ? 'red-100' : 'grey-10'}
    >
      {options.map((option) => (
        <Select.Item key={option} value={option}>
          <Select.ItemText>
            <span className="text-s text-grey-100">
              {t(`scenarios:edit_date.duration_unit_${option}`)}
            </span>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select.Default>
  );
};
