import { type EditorIdentifier } from '@app-builder/models';
import { useGetAggregatorName } from '@app-builder/services/editor';
import { Select } from '@ui-design-system';

export const AggregatorSelect = ({
  value,
  onChange,
  aggretatorOptions,
}: {
  value: string;
  onChange: (value: string) => void;
  aggretatorOptions: EditorIdentifier[];
}) => {
  const getAggregatorName = useGetAggregatorName();

  return (
    <Select.Root
      value={value}
      onValueChange={(selectedValue) => {
        if (selectedValue === null) {
          return;
        }
        onChange(selectedValue);
      }}
    >
      <Select.Trigger>
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        {aggretatorOptions.map((aggregator) => (
          <Select.Item
            className="min-w-[110px]"
            key={aggregator.name}
            value={aggregator.name}
          >
            <Select.ItemText>
              <span className="text-s text-grey-100">
                {getAggregatorName(aggregator.name)}
              </span>
            </Select.ItemText>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
