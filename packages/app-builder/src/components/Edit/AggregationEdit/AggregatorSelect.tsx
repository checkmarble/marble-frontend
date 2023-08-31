import {
  useEditorIdentifiers,
  useGetAggregatorName,
} from '@app-builder/services/editor';
import { Select } from '@ui-design-system';

export const AggregatorSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { aggregatorAccessors: aggregators } = useEditorIdentifiers();
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
      <Select.Trigger className="focus:border-purple-100 aria-[invalid=true]:border-red-100">
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        {aggregators.map((aggregator) => (
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
