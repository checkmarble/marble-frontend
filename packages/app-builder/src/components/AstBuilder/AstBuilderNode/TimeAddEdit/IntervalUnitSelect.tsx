import { Select } from '@ui-design-system';
import { useTranslation } from 'react-i18next';

const options = ['s', 'm', 'h'] as const;
export type IntervalUnit = (typeof options)[number];

export const IntervalUnitSelect = ({
  value,
  onChange,
}: {
  value: IntervalUnit | null;
  onChange: (value: IntervalUnit) => void;
}) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <Select.Default
      value={value ?? undefined}
      onValueChange={(selectedValue: IntervalUnit) => {
        if (selectedValue === null) return;
        onChange(selectedValue);
      }}
      placeholder="..."
      className="min-w-fit"
    >
      {options.map((operator) => (
        <Select.Item key={operator} value={operator}>
          <Select.ItemText>
            <span className="text-s text-grey-100">
              {t(`scenarios:edit_date.interval_unit_${operator}`)}
            </span>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select.Default>
  );
};
