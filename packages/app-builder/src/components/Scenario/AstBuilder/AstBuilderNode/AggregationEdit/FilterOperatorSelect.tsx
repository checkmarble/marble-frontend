import { type EvaluationError } from '@app-builder/models';
import { Select } from 'ui-design-system';

import { useGetOperatorName } from '../Operator';

export const FilterOperatorSelect = ({
  value,
  onChange,
  errors,
}: {
  value: string | null;
  onChange: (value: string) => void;
  errors: EvaluationError[];
}) => {
  const filterOperators = [
    '=',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    'IsInList',
    'IsNotInList',
  ];
  const getOperatorName = useGetOperatorName();

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
      <Select.Trigger borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}>
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
                <span className="text-s text-grey-100">
                  {getOperatorName(operator)}
                </span>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};
