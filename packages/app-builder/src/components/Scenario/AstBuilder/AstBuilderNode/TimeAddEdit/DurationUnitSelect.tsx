import { type Validation } from '@app-builder/models';
import { Select } from '@ui-design-system';
import { useTranslation } from 'react-i18next';

import { getBorderColor } from '../../utils';

const options = ['seconds', 'minutes', 'hours', 'days'] as const;
export type DurationUnit = (typeof options)[number];

export const DurationUnitSelect = ({
  value,
  onChange,
  validation,
}: {
  value: DurationUnit | null;
  onChange: (value: DurationUnit) => void;
  validation: Validation;
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
      borderColor={getBorderColor(validation)}
    >
      {options.map((operator) => (
        <Select.Item key={operator} value={operator}>
          <Select.ItemText>
            <span className="text-s text-grey-100">
              {t(`scenarios:edit_date.duration_unit_${operator}`)}
            </span>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select.Default>
  );
};
