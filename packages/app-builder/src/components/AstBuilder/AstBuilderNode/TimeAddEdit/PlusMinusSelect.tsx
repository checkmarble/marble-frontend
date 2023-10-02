import { Select } from '@ui-design-system';

const options = ['+', '-'] as const;
export type PlusOrMinus = (typeof options)[number];

export const PlusMinusSelect = ({
  value,
  onChange,
}: {
  value: PlusOrMinus | null;
  onChange: (value: PlusOrMinus) => void;
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
