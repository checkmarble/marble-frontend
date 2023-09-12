import { type Validation } from '@app-builder/models';
import { Select } from '@ui-design-system';

import { getBorderColor } from '../utils';

export const FilterOperatorSelect = ({
  value,
  onChange,
  validation,
}: {
  value: string | null;
  onChange: (value: string) => void;
  validation: Validation;
}) => {
  const filterOperators = ['=', '!=', '>', '<', '>=', '<='];

  return (
    <Select.Root
      value={value ?? undefined}
      onValueChange={(selectedValue) => {
        if (selectedValue === null) {
          return;
        }
        onChange(selectedValue);
      }}
    >
      <Select.Trigger borderColor={getBorderColor(validation)}>
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {filterOperators.map((operator) => (
            <Select.Item
              className="min-w-[110px]"
              key={operator}
              value={operator}
            >
              <Select.ItemText>
                <span className="text-s text-grey-100">{operator}</span>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};
