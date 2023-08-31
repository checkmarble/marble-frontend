import { Select } from '@ui-design-system';

export const FilterOperatorSelect = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string) => void;
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
      <Select.Trigger className="focus:border-purple-100 aria-[invalid=true]:border-red-100">
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
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
      </Select.Content>
    </Select.Root>
  );
};
