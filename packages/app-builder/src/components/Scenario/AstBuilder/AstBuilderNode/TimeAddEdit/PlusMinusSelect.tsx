import { type EvaluationError } from '@app-builder/models';
import { Select } from '@ui-design-system';

const options = ['+', '-'] as const;
export type PlusOrMinus = (typeof options)[number];

export const isPlusOrMinus = (value: string): value is PlusOrMinus => {
  return (options as ReadonlyArray<string>).includes(value);
};

export const PlusMinusSelect = ({
  value,
  onChange,
  errors,
}: {
  value: PlusOrMinus | null;
  onChange: (value: PlusOrMinus) => void;
  errors: EvaluationError[];
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
      borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}
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
