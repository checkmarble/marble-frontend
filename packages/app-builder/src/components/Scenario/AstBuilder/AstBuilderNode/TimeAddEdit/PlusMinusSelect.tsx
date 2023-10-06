import { type Validation } from '@app-builder/models';
import { Select } from '@ui-design-system';

import { getBorderColor } from '../../utils';

const options = ['+', '-'] as const;
export type PlusOrMinus = (typeof options)[number];

export const PlusMinusSelect = ({
  value,
  onChange,
  validation,
}: {
  value: PlusOrMinus | null;
  onChange: (value: PlusOrMinus) => void;
  validation: Validation;
}) => {
  return (
    <Select.Default
      value={value ?? undefined}
      onValueChange={(selectedValue: PlusOrMinus) => {
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
            <span className="text-s text-grey-100">{operator}</span>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select.Default>
  );
};
